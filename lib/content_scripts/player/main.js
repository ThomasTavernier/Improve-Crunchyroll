const skippersHandler = new SkippersHandler();
new MutationObserver((_, observer) => {
  const vilos = document.getElementById('vilos');
  if (!vilos) {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
      });
    }
    return;
  }
  observer.disconnect();
  chromeStorage.reload(
    'hide_dim_screen',
    'hide_skip_button',
    'skip_event_intro',
    'hide_subtitles',
    'hide_ui',
    'runnerThumbnail',
    'player_mode',
    'scrollbar',
  );
  new MutationObserver((_, observer) => {
    const player = vilos.querySelector('#player0');
    observer.disconnect();
    skippersHandler.init(player);
    playbackHandler(player);
    createAndInsertSvgDefs();
    const icDivPlayerControls = createIcDiv();
    const icDivPlayerMode = createDivPlayerMode();
    chromeStorage.LOADED.then(() => createFastForwardBackwardButtons(icDivPlayerControls));
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.fast_backward_buttons || changes.fast_forward_buttons) {
        createFastForwardBackwardButtons(icDivPlayerControls);
      }
    });
    shortcutHandler(skippersHandler);
    const settings = createSettings();
    new MutationObserver((mutations) => {
      const velocityControlsPackage = mutations.reduce(
        (f, { addedNodes }) => f || [...addedNodes].find(({ id }) => id === 'velocity-controls-package'),
        false,
      );
      if (!velocityControlsPackage) return;
      new MutationObserver((mutations) => {
        const addedNodes = mutations.flatMap(({ addedNodes }) => [...addedNodes]);
        if (addedNodes.length === 0) return;
        const vilosControlsContainer = addedNodes.find((node) => node.id === 'vilosControlsContainer');
        if (vilosControlsContainer) {
          insertCbpDivs(vilosControlsContainer, icDivPlayerControls.getElement(), icDivPlayerMode.getElement());
          new MutationObserver((mutations) => {
            if (mutations.some(({ addedNodes }) => [...addedNodes].some(({ children }) => children.length > 0))) {
              document.documentElement.setAttribute('ic_vilos_controls', `${true}`);
              insertCbpDivs(vilosControlsContainer, icDivPlayerControls.getElement(), icDivPlayerMode.getElement());
            } else {
              document.documentElement.setAttribute('ic_vilos_controls', `${false}`);
            }
          }).observe(vilosControlsContainer, {
            childList: true,
          });
        } else {
          const velocitySettingsMenu = velocityControlsPackage.querySelector('#velocity-settings-menu');
          if (velocitySettingsMenu) {
            insertSettings(velocitySettingsMenu, settings);
          }
        }
      }).observe(velocityControlsPackage, {
        childList: true,
      });
    }).observe(document.getElementById('vilosRoot'), {
      childList: true,
    });
  }).observe(vilos, {
    childList: true,
  });
}).observe(document.documentElement, {
  childList: true,
});
