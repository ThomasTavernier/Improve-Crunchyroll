const chromeStorage = new (class {
  constructor() {
    const NESTED = 'NESTED';
    this.CHROME_STORAGE = {
      fast_backward_buttons: '30,10',
      fast_forward_buttons: '30,90',
      header_on_hover: true,
      hide_background_image: true,
      hide_banner: true,
      hide_dim_screen: false,
      hide_message_box: true,
      hide_subtitles: false,
      player_mode: 2,
      scrollbar: false,
      shortcuts: NESTED,
      theater_mode: true,
      theme: 1,
    };
    const CHROME_STORAGE_NESTED = {
      shortcuts: {
        backward: {
          'ctrl||ArrowLeft': 10,
          'shift||ArrowLeft': 30,
        },
        forward: {
          'ctrl||ArrowRight': 30,
          'shift||ArrowRight': 90,
        },
      },
    };
    let chromeStorage;

    Object.keys(this.CHROME_STORAGE).forEach((key) => {
      this.__defineGetter__(key, () => chromeStorage[key]);
      this.__defineSetter__(key, (value) => {
        const obj = {};
        obj[key] = value;
        chrome.storage.local.set(obj);
      });
    });

    chrome.storage.local.get(this.CHROME_STORAGE, (items) => {
      chromeStorage = items;
      Object.entries(CHROME_STORAGE_NESTED).forEach(([key, defaultValue]) => {
        if (chromeStorage[key] === NESTED) {
          chromeStorage[key] = defaultValue;
        }
      });
      const ATTRIBUTES = ((origin) => {
        switch (origin) {
          case 'https://www.crunchyroll.com':
            const attributes = ['hide_background_image', 'hide_banner', 'hide_message_box', 'theme'];
            if (window.location.pathname.match(/-\d+$/)) {
              attributes.push('header_on_hover', 'player_mode', 'scrollbar', 'theme');
            }
            return attributes;
          case 'https://static.crunchyroll.com':
            return ['hide_dim_screen', 'hide_subtitles', 'player_mode', 'scrollbar'];
          case `chrome-extension://${chrome.runtime.id}`:
            return ['theme'];
        }
      })(window.location.origin);

      ATTRIBUTES.forEach((attribute) => {
        document.documentElement.setAttribute(`ic_${attribute}`, chromeStorage[attribute]);
      });

      chrome.storage.local.onChanged.addListener((changes) => {
        Object.entries(changes).forEach(([key, storageChange]) => {
          if (storageChange.newValue === NESTED && CHROME_STORAGE_NESTED[key]) {
            chromeStorage[key] = CHROME_STORAGE_NESTED[key];
          } else {
            chromeStorage[key] = storageChange.newValue;
          }
          if (ATTRIBUTES.includes(key)) {
            document.documentElement.setAttribute('ic_' + key, chromeStorage[key]);
          }
        });
      });
    });
  }
})();
