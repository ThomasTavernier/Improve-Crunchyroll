function shortcutHandler(skippersHandler) {
  window.addEventListener(
    'keydown',
    (ev) => {
      const key = shortcutUtils.eventToKey(ev);
      Object.entries({
        forward,
        backward,
        speedUp: (value) => setPlaybackRate(document.getElementById('player0').playbackRate + +value, true),
        speedDown: (value) => setPlaybackRate(document.getElementById('player0').playbackRate - +value, true),
        skip: () => skippersHandler.skipActiveIfAny(),
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
              data: "previousEpisode",
            }
          });
        },
        nextEpisode: () => {
          chrome.runtime.sendMessage(chrome.runtime.id, {
            type: 'message',
            data: {
              type: 'shortcut',
              data: "nextEpisode",
            }
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
    },
    true,
  );
}
