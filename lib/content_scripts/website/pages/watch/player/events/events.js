class Events extends PlayerChild {
  initPlayer(player) {
    super.initPlayer(player);
    const playerClickPane = document.querySelector('[data-testid="player-controls-root"]');
    const listener = (e) => {
      if (!chromeStorage.maximize_on_double_click) return;
      // if the click target is not a direct child of the player click pane, traverse to the nearest visible element
      // and check if this is a child of the click pane. some ui elements are nested, so this is necessary
      if (e.target.parentNode != playerClickPane) {
        let currentNode = e.target.parentNode;
        while (!currentNode.checkVisibility()) currentNode = currentNode.parentNode;

        if (
          currentNode.parentNode != playerClickPane &&
          // cover edgecase: the space between the left and right bottom controls is seen as visible by js, although
          // it's see-through
          !(document.querySelector('[data-testid="bottom-left-controls-stack"]').parentNode == currentNode)
        ) return;
      }
      document.querySelector('[data-testid="fullscreen-button"]')?.click();
    };
    playerClickPane.addEventListener('dblclick', listener);
    this.onDestroy(() => playerClickPane.removeEventListener('dblclick', listener));
  }
}
