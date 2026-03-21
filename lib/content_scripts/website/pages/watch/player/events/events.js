class Events extends PlayerChild {
  constructor() {
    super();
    const listener = () => {
      if (!chromeStorage.maximize_on_double_click) return;
      document.querySelector('[data-testid="fullscreen-button"]')?.click();
    };
    window.addEventListener('dblclick', listener);
    this.onDestroy(() => window.removeEventListener('dblclick', listener));
  }
}
