chrome.runtime.onMessage.addListener(function ({ type, data }, { tab: { id: tabId } }, sendResponse) {
  switch (type) {
    case 'skippers':
      const {
        metadata: { id: mediaId, duration, episode_number, title },
        subtitles,
      } = data;
      Promise.all([
        new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(
            tabId,
            {
              type,
              data: { mediaId, episode_number, title, subtitles },
            },
            ([currentSubtitles, previousSubtitles]) => {
              if (
                !currentSubtitles.some(({ language: currentLanguage, format: currentFormat, url: currentUrl }) => {
                  const previousSubtitle = previousSubtitles.find(
                    ({ locale, language, format }) =>
                      (currentLanguage === locale || currentLanguage === language) && currentFormat === format,
                  );
                  return Promise.all(
                    [currentUrl, ...(previousSubtitle ? [previousSubtitle.url] : [])].map((url) =>
                      fetch(url)
                        .then((response) => response.text())
                        .then((text) => {
                          return text.match(/Dialogue:.*/g).reduce((acc, dialogue) => {
                            const [
                              layer,
                              startText,
                              endText,
                              style,
                              name,
                              marginL,
                              marginR,
                              marginV,
                              effect,
                              ...texts
                            ] = dialogue.split(',');
                            const [start, end] = [startText, endText].map((text) =>
                              text
                                .split(':')
                                .reverse()
                                .reduce((acc, v, i) => acc + ~~v * Math.pow(60, i), 0),
                            );
                            const type = `${style}-${name}`;
                            if (!type.match(/title|sign|show/i)) {
                              acc.push({
                                start,
                                end,
                                key: `${type}-${texts.join().replaceAll(/({[^}]*})|(\\.)/g, '')}`,
                              });
                            }
                            return acc;
                          }, []);
                        }),
                    ),
                  ).then((subs) => {
                    const MIN_DURATION = 75;
                    const currentSub = subs.shift();
                    const durationInSeconds = duration / 1000;
                    const MAX_DURATION = durationInSeconds / 4;
                    const fake = {
                      start: durationInSeconds,
                      end: durationInSeconds,
                    };
                    currentSub.push(fake, fake);
                    const keys = new Set(subs.map((sub) => sub.map((s) => s.key)).flat());
                    let lastGroup;
                    let lastValue = { end: 0 };
                    resolve(
                      currentSub.reduce((acc, value) => {
                        if (keys.has(value.key) || value.start - lastValue.end >= MIN_DURATION) {
                          if (!lastGroup) {
                            lastGroup = {
                              start: lastValue.end,
                              end: value.start,
                            };
                          }
                        } else {
                          if (lastGroup) {
                            if (lastGroup.end !== lastValue.start) {
                              lastGroup.end = value.start;
                            }
                            const lastGroupDuration = lastGroup.end - lastGroup.start;
                            if (MIN_DURATION <= lastGroupDuration && lastGroupDuration <= MAX_DURATION) {
                              acc.push(lastGroup);
                            }
                            lastGroup = undefined;
                          }
                        }
                        lastValue = value;
                        return acc;
                      }, []),
                    );
                  });
                })
              ) {
                reject();
              }
            },
          );
        }),
        fetch(`https://static.crunchyroll.com/skip-events/production/${mediaId}.json`)
          .then((response) => response.json())
          .then((data) => {
            return Object.values(data).reduce((acc, { start, end }) => {
              if (typeof start === 'number' && typeof end === 'number') {
                acc.push({ start, end, native: true });
              }
              return acc;
            }, []);
          })
          .catch(() => []),
      ])
        .then(([skippers, nativeSkippers]) =>
          nativeSkippers.length
            ? [
                ...skippers.filter(
                  ({ start, end }) =>
                    !nativeSkippers.some(
                      ({ start: nativeStart, end: nativeEnd }) =>
                        (nativeStart <= start && start <= nativeEnd) || (start <= nativeStart && nativeStart <= end),
                    ),
                ),
                ...nativeSkippers,
              ].sort((a, b) => a.start - b.start)
            : skippers,
        )
        .then((data) => {
          sendResponse(data);
        })
        .catch(() => {
          sendResponse([]);
        });
      return true;
    default:
      sendResponse();
  }
});
