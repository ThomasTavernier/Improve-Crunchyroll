const skipFn = skippersHandler();
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
  document.onfullscreenchange = () => {
    document.documentElement.setAttribute('ic_fullscreen', `${!!document.fullscreenElement}`);
  };
  chromeStorage.reload(
    'hide_dim_screen',
    'hide_play_pause_button',
    'hide_skip_button',
    'hide_subtitles',
    'hide_ui',
    'runnerThumbnail',
    'player_mode',
    'scrollbar',
  );
  new MutationObserver((_, observer) => {
    observer.disconnect();
    playbackHandler();
    createAndInsertSvgDefs();
    const [icDivPlayerControls, icDivPlayerMode] = createDivs(2);
    createPlayerButton(icDivPlayerMode);
    chromeStorage.LOADED.then(() => createFastForwardBackwardButtons(icDivPlayerControls));
    shortcutHandler(skipFn);
    const settings = createSettings();
    new MutationObserver((mutations) => {
      const velocityControlsPackage = mutations.reduce(
        (f, { addedNodes }) => f || [...addedNodes].find(({ id }) => id === 'velocity-controls-package'),
        false,
      );
      if (!velocityControlsPackage) return;
      new MutationObserver((mutations) => {
        const [addedNode] = mutations.flatMap(({ addedNodes }) => [...addedNodes]);
        if (!addedNode) return;
        if (addedNode.id === 'vilosControlsContainer') {
          insertCbpDivs(addedNode, icDivPlayerControls, icDivPlayerMode);
          new MutationObserver((mutations) => {
            if (mutations.some(({ addedNodes }) => [...addedNodes].some(({ children }) => children.length > 0))) {
              document.documentElement.setAttribute('ic_vilos_controls', `${true}`);
              insertCbpDivs(addedNode, icDivPlayerControls, icDivPlayerMode);
            } else {
              document.documentElement.setAttribute('ic_vilos_controls', `${false}`);
            }
          }).observe(addedNode, {
            childList: true,
          });
        } else {
          const velocitySettingsMenu = addedNode.querySelector('#velocity-settings-menu');
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
