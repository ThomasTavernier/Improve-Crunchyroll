function doubleClickHandler() {
  window.addEventListener('dblclick', () => {
    if (!chromeStorage.maximize_on_double_click) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  })
}
