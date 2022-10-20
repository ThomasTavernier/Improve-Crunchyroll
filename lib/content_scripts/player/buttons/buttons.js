function createPlayerButton(icDivPlayerMode) {
  [
    {
      className: 'scrollbar',
      chromeStorageKey: 'scrollbar',
      title: 'scrollbar',
      onChange: () =>
        chrome.storage.local.set({
          scrollbar: !chromeStorage.scrollbar,
        }),
    },
    {
      className: 'theater_mode',
      chromeStorageKey: 'theater_mode',
      title: 'theaterMode',
      onChange: () =>
        chrome.storage.local.set({
          theater_mode: !chromeStorage.theater_mode,
          player_mode:
            chromeStorage.player_mode === 0 || chromeStorage.player_mode === 1
              ? !chromeStorage.theater_mode
                ? 1
                : 0
              : chromeStorage.player_mode,
        }),
    },
    {
      className: 'fullscreen_mode',
      chromeStorageKey: 'player_mode',
      eq: 2,
      title: 'fullscreenMode',
      onChange: () =>
        chrome.storage.local.set({
          player_mode: (chromeStorage.player_mode === 2 ? 0 : 2) === 2 ? 2 : chromeStorage.theater_mode ? 1 : 0,
        }),
    },
  ].forEach((button) => {
    let span = document.createElement('span');
    span.className = `ic_buttons ic_${button.className}_button`;
    span.title = translate(button.title);
    span.addEventListener('click', (ev) => {
      ev.stopPropagation();
      button.onChange();
    });
    icDivPlayerMode.appendChild(span);
  });
}
