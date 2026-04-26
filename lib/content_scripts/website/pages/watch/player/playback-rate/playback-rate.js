class PlaybackRate extends PlayerChild {
  initPlayer(player) {
    super.initPlayer(player);
    const playbackMenuParent = document.querySelector('[data-testid="playback-speed-button"]')?.parentElement
      ?.parentElement;
    if (playbackMenuParent) {
      const elements = this.#createPlaybackSettings(player);
      this.#handlePlaybackSettingsInsertion(playbackMenuParent, elements);
      this.#handlePlaybackRateChanges(player, elements);
    }
  }

  #handlePlaybackSettingsInsertion(playbackMenuParent, elements) {
    const observer = new MutationObserver(() => {
      const playbackMenu = playbackMenuParent.querySelector('[data-testid="playback-speed-menu"]')?.firstChild;
      if (playbackMenu) {
        const child = playbackMenu.firstElementChild.nextElementSibling;
        elements.forEach((element) => {
          playbackMenu.insertBefore(element, child);
        });
      }
    });
    observer.observe(playbackMenuParent, {
      childList: true,
    });
    this.onDestroy(() => observer.disconnect());
  }

  #handlePlaybackRateChanges(player, elements) {
    const listener = () => {
      const playbackRate = localStorage.getItem(Playback.BIT_MOVIN_PLAYBACK_RATE_KEY);
      if (playbackRate) {
        Playback.setPlaybackRate(player, +playbackRate, false);
        elements.forEach((element) => {
          const slider = element.querySelector('input[type="range"]');
          if (slider) {
            slider.value = playbackRate;
          }
        });
      }
    };
    player.addEventListener('ratechange', listener);
    this.onDestroy(() => player.removeEventListener('ratechange', listener));
  }

  #createPlaybackSettings(player) {
    const elementByValues = {};
    const listener = ({ target: { playbackRate } }) => {
      if (!playbackRate) return;
      const key = playbackRate in elementByValues ? playbackRate : 'slider';
      const {
        [key]: { element, option },
      } = elementByValues;
      Object.values(elementByValues).forEach(({ element: ele }) => {
        ele.setAttribute('value', 'false');
      });
      element.setAttribute('value', 'true');
      if (key === 'slider') {
        element.getElement().querySelector('.text').innerText = playbackRate + 'x';
        option.value = playbackRate;
      }
    };
    player.addEventListener('ratechange', listener);
    this.onDestroy(() => player.removeEventListener('ratechange', listener));
    return [
      {
        type: 'slider',
        value: '1',
        min: 0.25,
        max: 4,
        step: 0.05,
      },
    ].map((option) => {
      const element = new Renderer('div')
        .addClass('ic_option')
        .appendChildren(new Renderer('span').addClass('text').setText(option.value + 'x'))
        .addEventListener('click', () => {
          Playback.setPlaybackRate(player, option.value, true);
        });
      if (option.type === 'slider') {
        element.appendChildren(
          new Renderer('input')
            .setAttribute('type', 'range')
            .setAttribute('min', option.min)
            .setAttribute('max', option.max)
            .setAttribute('step', option.step)
            .setAttribute('value', option.value)
            .addEventListener('input', ({ target: { value } }) => {
              option.value = value;
              element.getElement().querySelector('.text').innerText = option.value + 'x';
            }),
        );
      }
      elementByValues[option.type || option.value] = { element, option };
      return element.getElement();
    });
  }
}
