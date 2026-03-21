class NativeSkipper {
  skipped = false;

  constructor(start, end, type) {
    this.start = start;
    this.end = end;
    if (type) {
      this.key = `skip_event_${type}`;
    }
  }

  click(player) {
    if (this.isVisible()) {
      this.skipped = true;
      const before = player.currentTime;
      FastForwardBackward.goToTime(player, this.end);
      if (Math.abs(before - this.end) >= 4) {
        setTimeout(() => {
          if (Math.abs(player.currentTime - this.end) >= 2) {
            this.skipped = false;
          }
        }, 1000);
      }
    }
  }

  check(player, currentTime) {
    const isInPeriod = currentTime >= this.start && this.end > currentTime + 1;
    if (isInPeriod && !this.skipped && this.isAutoSkip()) {
      this.click(player);
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

class Skippers extends PlayerChild {
  attributes = ['skip_event_credits', 'skip_event_intro', 'skip_event_preview', 'skip_event_recap'];
  static #activeSkipper;

  #lastTime;
  #loaded = false;
  #mediaId;
  #skippers;

  constructor() {
    super();
    this.timeUpdate = this.timeUpdate.bind(this);
    this.#createAndInsertSvgDefs();
  }

  #createAndInsertSvgDefs() {
    const element = Render.createSvgDefs().getElement();
    document.body.appendChild(element);
    this.onDestroy(() => document.body.removeChild(element));
  }

  static skipActiveIfAny(player) {
    if (Skippers.#activeSkipper) {
      Skippers.#activeSkipper.click(player);
    }
  }

  initMediaId(mediaId) {
    super.initMediaId(mediaId);
    if (mediaId && mediaId !== this.#mediaId) {
      this.#mediaId = mediaId;
      this.#sendMessageSkippers(mediaId);
    }
  }

  initPlayer(player) {
    super.initPlayer(player);
    this.#subscribeToPlayerEvents(player);
  }

  #subscribeToPlayerEvents(player) {
    player.addEventListener('timeupdate', this.timeUpdate);
    this.onDestroy(() => player.removeEventListener('timeupdate', this.timeUpdate));
    player.addEventListener('seeking', this.timeUpdate);
    this.onDestroy(() => player.removeEventListener('seeking', this.timeUpdate));
  }

  timeUpdate(event) {
    if (!this.#loaded) return;
    const currentTime = ~~event.target.currentTime;
    if (this.#lastTime !== currentTime) {
      this.#lastTime = currentTime;
      if (!Skippers.#activeSkipper || !Skippers.#activeSkipper.check(this.player, currentTime)) {
        Skippers.#activeSkipper = this.#findActiveSkipper(currentTime);
      }
    }
  }

  #findActiveSkipper(currentTime) {
    return this.#skippers.find(
      (skipper) => Skippers.#activeSkipper !== skipper && skipper.check(this.player, currentTime),
    );
  }

  #sendMessageSkippers(mediaId) {
    this.#loaded = false;
    Skippers.#activeSkipper = undefined;
    this.#skippers = undefined;
    chrome.runtime.sendMessage(
      chrome.runtime.id,
      {
        type: 'nativeSkippers',
        data: {
          mediaId,
        },
      },
      (skipEvents) => {
        if (Array.isArray(skipEvents) && this.#mediaId === mediaId) {
          this.#skippers = this.#buildSkippers(skipEvents);
          this.#loaded = true;
        }
      },
    );
  }

  #buildSkippers(skipEvents) {
    return skipEvents.map(({ start, end, native, type }) => {
      if (native) {
        return new NativeSkipper(start, end, type);
      }
    });
  }
}
