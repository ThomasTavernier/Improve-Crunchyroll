class Player extends Parent {
  get attributes() {
    return [
      ...super.attributes,
      'header_on_hover',
      'hide_dim_screen',
      'hide_ui',
      'runnerThumbnail',
      'player_mode',
      'scrollbar',
    ];
  }

  static pattern = new RegExp(
    '^' +
      '(\\/[a-z-]+)?' + // optional prefix like /foo-bar
      '\\/watch\\/' + // literal /watch/
      '(?<id>[A-Z0-9]+)' + // named group: id
      '\\/', // trailing slash
  );

  constructor() {
    super(Events, PlaybackRate, Shortcuts, Skippers);

    const match = location.pathname.match(Player.pattern);

    if (match?.groups) {
      this.children.forEach((child) => {
        child.initMediaId(match.groups.id);
      });
    }

    const player = document.querySelector('video');
    if (player) {
      this.initPlayer(player);
    } else {
      const observer = new MutationObserver((_, observer) => {
        const player = document.querySelector('video');
        if (player) {
          observer.disconnect();
          this.initPlayer(player);
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      this.onDestroy(() => observer.disconnect());
    }
  }

  initPlayer(player) {
    this.children.forEach((child) => {
      child.initPlayer(player);
    });
    this.#playbackHandler(player);
    this.#insertTopOptions(player);
    this.#insertBottomOptions(player);
  }

  #playbackHandler(player) {
    const playListener = () => {
      document.documentElement.setAttribute('ic_playing', 'true');
    };
    player.addEventListener('play', playListener);
    this.onDestroy(() => player.removeEventListener('play', playListener));

    const pauseListener = () => {
      document.documentElement.setAttribute('ic_playing', 'false');
    };
    player.addEventListener('pause', pauseListener);
    this.onDestroy(() => player.removeEventListener('pause', pauseListener));
  }

  #insertTopOptions(player) {
    let controls = document.querySelector('[data-testid="top-right-controls-stack"]');
    if (controls) {
      const element = Buttons.createDivPlayerMode(player).getElement();
      controls.insertBefore(element, controls.firstChild);
      this.onDestroy(() => controls.removeChild(element));
    }
  }

  #insertBottomOptions(player) {
    let controls = document.querySelector('[data-testid="bottom-left-controls-stack"]');
    if (controls) {
      const icDivPlayerControls = Render.createIcDiv();
      controls.insertBefore(icDivPlayerControls.getElement(), controls.lastChild);
      this.onDestroy(() => controls.removeChild(icDivPlayerControls.getElement()));

      const listener = (changes) => {
        if (changes.fast_backward_buttons || changes.fast_forward_buttons) {
          FastForwardBackward.createFastForwardBackwardButtons(player, icDivPlayerControls);
        }
      };
      chromeStorage.LOADED.then(() =>
        FastForwardBackward.createFastForwardBackwardButtons(player, icDivPlayerControls),
      );
      chrome.storage.onChanged.addListener(listener);
      this.onDestroy(() => chrome.storage.onChanged.removeListener(listener));
    }
  }
}
