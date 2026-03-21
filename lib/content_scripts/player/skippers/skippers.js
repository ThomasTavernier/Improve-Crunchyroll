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

class SkippersHandler {
  #activeSkipper;
  #lastTime;
  #loaded = false;
  #mediaId;
  #skippers;

  constructor() {
    window.addEventListener('message', ({ data }) => {
      const parsedData = JSON.parse(data);
      if (this.#isConfig(parsedData.method)) {
        const {
          value: { media },
        } = parsedData;
        if (this.#setMediaId(media.metadata.id)) {
          this.#sendMessageSkippers(media);
        }
      }
    });
  }

  init(player) {
    player.addEventListener('timeupdate', (event) => this.#timeUpdate(event));
    player.addEventListener('seeking', (event) => this.#timeUpdate(event));
  }

  skipActiveIfAny() {
    if (this.#activeSkipper) {
      this.#activeSkipper.click();
    }
  }

  #timeUpdate(event) {
    if (!this.#loaded) return;
    const currentTime = ~~event.target.currentTime;
    if (this.#lastTime !== currentTime) {
      this.#lastTime = currentTime;
      if (!this.#activeSkipper || !this.#activeSkipper.check(currentTime)) {
        this.#activeSkipper = this.#findActiveSkipper(currentTime);
      }
    }
  }

  #findActiveSkipper(currentTime) {
    return this.#skippers.find((skipper) => this.#activeSkipper !== skipper && skipper.check(currentTime));
  }

  #isConfig(method) {
    return method === 'loadConfig' || method === 'extendConfig';
  }

  #setMediaId(mediaId) {
    if (mediaId && mediaId !== this.#mediaId) {
      this.#mediaId = mediaId;
      return true;
    }
    return false;
  }

  #sendMessageSkippers(media) {
    this.#loaded = false;
    this.#activeSkipper = undefined;
    if (this.#skippers) {
      this.#skippers.forEach((skipper) => {
        if (skipper instanceof CustomSkipper) {
          skipper.remove();
        }
      });
      this.#skippers = undefined;
    }
    const { metadata, subtitles, playService } = media;
    chrome.runtime.sendMessage(
      chrome.runtime.id,
      {
        type: 'skippers',
        data: {
          metadata,
          subtitles: playService
            ? playService.subtitles
            : subtitles.reduce((acc, subtitle) => {
              acc[subtitle.language] = subtitle;
              return acc;
            }, {}),
        },
      },
      (skipEvents) => {
        if (Array.isArray(skipEvents) && this.#mediaId === metadata.id) {
          this.#skippers = this.#buildSkippers(skipEvents);
          this.#loaded = true;
        }
      },
    );
  }

  #buildSkippers(skipEvents) {
    const vilosRoot = document.querySelector('#vilosRoot');
    return skipEvents.map(({ start, end, native, type }) => {
      if (native) {
        return new NativeSkipper(start, end, type);
      } else {
        const customSkipper = new CustomSkipper(start, end);
        vilosRoot.appendChild(customSkipper.renderer.getElement());
        return customSkipper;
      }
    });
  }
}
