class NativeSkipper {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  click() {
    document.querySelector('[data-testid="skipButton"] > div')?.click();
  }

  check(currentTime) {
    return currentTime >= this.start && this.end > currentTime + 1;
  }
}

class CustomSkipper extends NativeSkipper {
  skipped = false;

  constructor(start, end) {
    super(start, end);
    this.renderer = new Renderer('div')
      .addClass('ic_skipper')
      .addEventListener('click', () => this.click())
      .appendChildren(
        new Renderer('span').setText(Renderer.translate('skipTo')),
        new Renderer('span').setText(parseNumber(this.end)),
      );
    document.body.appendChild(this.renderer.getElement());
  }

  click() {
    this.skipped = true;
    goToTime(this.end);
  }

  check(currentTime) {
    const inPeriod = super.check(currentTime);
    if (inPeriod) {
      this.setActive();
      if (currentTime - 5 >= this.start) {
        this.setPast();
      } else {
        this.unsetPast();
      }
    } else if (this.active) {
      this.unsetActive();
    }
    return inPeriod;
  }

  setActive() {
    if (!this.active) {
      this.active = true;
      this.renderer.addClass('active');
    }
  }

  unsetActive() {
    if (this.active) {
      this.active = false;
      this.renderer.removeClass('active');
    }
  }

  setPast() {
    if (!this.past) {
      this.past = true;
      this.renderer.addClass('past');
    }
  }

  unsetPast() {
    if (this.past) {
      this.past = false;
      this.renderer.removeClass('past');
    }
  }

  remove() {
    this.renderer.remove();
  }
}

function skippersHandler() {
  let mediaId;
  let activeSkipper;
  window.addEventListener('message', ({ data }) => {
    const { method, value } = JSON.parse(data);
    if (method === 'loadConfig' || method === 'extendConfig') {
      const {
        media: { metadata, subtitles },
      } = value;
      const { id } = metadata;
      if (id && id !== mediaId) {
        mediaId = id;
        chrome.runtime.sendMessage(
          chrome.runtime.id,
          {
            type: 'skippers',
            data: {
              metadata,
              subtitles,
            },
          },
          (skipEvents) => {
            if (Array.isArray(skipEvents)) {
              const skippers = skipEvents.map(({ start, end, native }) =>
                native ? new NativeSkipper(start, end) : new CustomSkipper(start, end),
              );
              const player = document.getElementById('player0');

              let lastTime;
              const timeupdate = () => {
                const currentTime = ~~player.currentTime;
                if (lastTime !== currentTime) {
                  lastTime = currentTime;
                  if (!activeSkipper || !activeSkipper.check(currentTime)) {
                    activeSkipper = skippers.find((skipper) => activeSkipper !== skipper && skipper.check(currentTime));
                  }
                }
              };

              player.addEventListener('timeupdate', timeupdate);
              player.addEventListener('seeking', timeupdate);
              player.addEventListener(
                'loadstart',
                () => {
                  player.removeEventListener('timeupdate', timeupdate);
                  player.removeEventListener('seeking', timeupdate);
                  skippers.forEach((skipper) => {
                    if (skipper instanceof CustomSkipper) {
                      skipper.remove();
                    }
                  });
                },
                { once: true },
              );
            }
          },
        );
      }
    }
  });
  return () => {
    if (activeSkipper) {
      return activeSkipper.click();
    }
  };
}
