chrome.runtime.onMessage.addListener(function ({ type, data }, { tab: { id: tabId } }, sendResponse) {
  switch (type) {
    case 'skippers':
      const {
        analytics: { legacy },
        media: {
          metadata: { id: mediaId, duration },
          subtitles: currentSubtitles,
        },
      } = data;
      new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
          tabId,
          {
            type,
            data: { mediaId, legacyMediaId: legacy && legacy.media_id },
          },
          (previousSubtitles) => {
            if (
              !currentSubtitles.some(({ language: currentLanguage, format: currentFormat, url: currentUrl }) => {
                const previousSubtitle = previousSubtitles.find(
                  ({ locale, language, format }) =>
                    (currentLanguage === locale || currentLanguage === language) && currentFormat === format
                );
                if (previousSubtitle) {
                  return Promise.all(
                    [currentUrl, previousSubtitle.url].map((url) =>
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
                                .reduce((acc, v, i) => acc + ~~v * Math.pow(60, i), 0)
                            );
                            const text = texts.join().replaceAll(/({[^}]*})|(\\.)/g, '');
                            acc.push({
                              start,
                              end,
                              style,
                              name,
                              text,
                              key: [style, name, text].join(),
                            });
                            return acc;
                          }, []);
                        })
                    )
                  ).then((subs) => {
                    const MIN_DURATION = 75;
                    const currentSub = subs.shift();
                    const durationInSeconds = duration / 1000;
                    const fake = {
                      start: durationInSeconds,
                      end: durationInSeconds,
                    };
                    currentSub.push(fake, fake);
                    const keys = new Set(subs.map((sub) => sub.map((s) => s.key)).flat());
                    let lastGroup;
                    let lastValue;
                    resolve(
                      currentSub.reduce((acc, value) => {
                        if (
                          (value.key && keys.has(value.key)) ||
                          value.start - ((lastValue && lastValue.end) || 0) >= MIN_DURATION
                        ) {
                          if (!lastGroup) {
                            lastGroup = {
                              start: (lastValue && lastValue.end) || 0,
                            };
                          }
                        } else {
                          if (lastGroup) {
                            lastGroup.end = value.start;
                            if (lastGroup.end - lastGroup.start >= MIN_DURATION) {
                              acc.push(lastGroup);
                            }
                          }
                          lastGroup = undefined;
                        }
                        if (
                          lastGroup ||
                          ![value.name, value.style].some((s) => s && s.toLowerCase().includes('title'))
                        ) {
                          lastValue = value;
                        }
                        return acc;
                      }, [])
                    );
                  });
                }
              })
            ) {
              reject();
            }
          }
        );
      })
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
