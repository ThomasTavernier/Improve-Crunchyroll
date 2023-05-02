class NativeSkipper {
  skipped = false;

  constructor(start, end, type) {
    this.start = start;
    this.end = end;
    if (type) {
      this.key = `skip_event_${type}`;
    }
  }

  click() {
    if (this.isVisible()) {
      this.skipped = true;
      goToTime(this.end);
    }
  }

  check(currentTime) {
    const isInPeriod = currentTime >= this.start && this.end > currentTime + 1;
    if (isInPeriod && !this.skipped && this.isAutoSkip()) {
      this.click();
    }
    return isInPeriod;
  }

  isAutoSkip() {
    return chromeStorage[this.key] === 2;
  }

  isVisible() {
    return chromeStorage[this.key] !== 0;
  }
}

class CustomSkipper extends NativeSkipper {
  static TIME_SHOWN_WITHOUT_HOVER = 3;

  constructor(start, end) {
    super(start, end);
    this.renderer = new Renderer('div')
      .addClass('ic_skipper')
      .addEventListener('click', () => this.click())
      .appendChildren(
        new Renderer('img').setAttribute(
          'src',
          'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFF%22%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Cpath%20d%3D%22M23%205v14h-2v-6.364L11%2019V5l10%206.364V5h2z%22%20transform%3D%22translate(-153%20-905)%20translate(120%20881)%20translate(17%2016)%20translate(16%208)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M1%205L1%2019%2012%2012z%22%20transform%3D%22translate(-153%20-905)%20translate(120%20881)%20translate(17%2016)%20translate(16%208)%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
        ),
        new Renderer('span').setText(Renderer.translate('skipTo', parseNumber(this.end))),
      );
    document.body.appendChild(this.renderer.getElement());
  }

  check(currentTime) {
    const isInPeriod = super.check(currentTime);
    if (isInPeriod) {
      this.setActive();
      if (currentTime - CustomSkipper.TIME_SHOWN_WITHOUT_HOVER >= this.start) {
        this.setPast();
      } else {
        this.unsetPast();
      }
    } else if (this.active) {
      this.unsetActive();
    }
    return isInPeriod;
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

  isAutoSkip() {
    return chromeStorage.auto_skip;
  }

  isVisible() {
    return !chromeStorage.hide_skip_button;
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
              const skippers = skipEvents.map(({ start, end, native, type }) =>
                native ? new NativeSkipper(start, end, type) : new CustomSkipper(start, end),
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
