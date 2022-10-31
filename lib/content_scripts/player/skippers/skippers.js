function createSkipper(skipper, player) {
  const element = document.createElement('div');
  element.className = 'ic_skipper';
  element.addEventListener('click', () => {
    skipper.skipped = true;
    element.classList.remove('active');
    forward(skipper.end - player.currentTime);
  });
  [Renderer.translate('skipTo'), parseNumber(skipper.end)].forEach((text) => {
    const span = document.createElement('span');
    span.innerText = text;
    element.appendChild(span);
  });
  skipper.element = element;
  return element;
}

function skippersHandler() {
  let mediaId;
  let activeSkipper;
  window.addEventListener('message', ({ data }) => {
    const { method, value } = JSON.parse(data);
    if (method === 'loadConfig' || method === 'extendConfig') {
      const {
        media: {
          metadata: { id },
        },
      } = value;
      if (id && id !== mediaId) {
        mediaId = id;
        chrome.runtime.sendMessage(chrome.runtime.id, { type: 'skippers', data: value }, (skippers) => {
          if (Array.isArray(skippers)) {
            const player = document.getElementById('player0');
            let lastTime;
            skippers.forEach((skipper) => document.body.appendChild(createSkipper(skipper, player)));
            const timeupdate = () => {
              const currentTime = ~~player.currentTime;
              if (lastTime !== currentTime) {
                lastTime = currentTime;
                skippers.forEach((skipper) => {
                  if (skipper.end > currentTime + 1 && currentTime > skipper.start) {
                    activeSkipper = skipper;
                    skipper.element.classList.add('active');
                    if (currentTime - 5 >= skipper.start) {
                      skipper.element.classList.add('past');
                    } else {
                      skipper.element.classList.remove('past');
                    }
                    if (chromeStorage.auto_skip && !skipper.skipped) {
                      skipper.element.click();
                    }
                  } else {
                    skipper.element.classList.remove('active');
                    if (skipper === activeSkipper) {
                      activeSkipper = undefined;
                    }
                  }
                });
              }
            };
            player.addEventListener('timeupdate', timeupdate);
            player.addEventListener(
              'loadstart',
              () => {
                player.removeEventListener('timeupdate', timeupdate);
              },
              { once: true },
            );
          }
        });
      }
    }
  });
  return () => activeSkipper?.element?.click();
}
