class Shortcuts extends PlayerChild {
  constructor() {
    super();

    const listener = (ev) => this.handle(ev);
    window.addEventListener('keydown', listener, true);
    this.onDestroy(() => window.removeEventListener('keydown', listener));
  }

  handle(ev) {
    const key = ShortcutUtils.eventToKey(ev);
    Object.entries({
      forward: (time) => FastForwardBackward.forward(this.player, time),
      backward: (time) => FastForwardBackward.backward(this.player, time),
      speedUp: (value) => Playback.setPlaybackRate(this.player, this.player.playbackRate + +value, true),
      speedDown: (value) => Playback.setPlaybackRate(this.player, this.player.playbackRate - +value, true),
      skip: () => Skippers.skipActiveIfAny(this.player),
      ...[
        ['toggleHideUiWhilePlaying', 'playing'],
        ['toggleHideUiWhileFullscreen', 'fullscreen'],
        ['toggleHideUiWhilePlayingOrFullscreen', 'playingOrFullscreen'],
        ['toggleHideUiWhilePlayingAndFullscreen', 'playingAndFullscreen'],
      ].reduce(
        (acc, [type, value]) => ({
          ...acc,
          [type]: () =>
            document.documentElement.setAttribute(
              'ic_hide_ui',
              (document.documentElement.getAttribute('ic_hide_ui') !== value && value) || '',
            ),
        }),
        {},
      ),
      previousEpisode: () => {
        chrome.runtime.sendMessage(chrome.runtime.id, {
          type: 'message',
          data: {
            type: 'shortcut',
            data: 'previousEpisode',
          },
        });
      },
      nextEpisode: () => {
        chrome.runtime.sendMessage(chrome.runtime.id, {
          type: 'message',
          data: {
            type: 'shortcut',
            data: 'nextEpisode',
          },
        });
      },
    }).forEach(([type, fn]) => {
      const {
        shortcuts: { [type]: shortcut },
        disable_numpad,
      } = chromeStorage;
      if (!shortcut) return;
      if (shortcut === key) {
        fn();
      } else if (typeof shortcut === 'object' && key in shortcut) {
        fn(shortcut[key]);
      } else if (!disable_numpad || ev.location !== 3) {
        return;
      }
      ev.stopPropagation();
    });
  }
}
