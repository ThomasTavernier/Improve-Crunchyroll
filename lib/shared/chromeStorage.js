const chromeStorage = new (class {
  NESTED = 'NESTED';
  CHROME_STORAGE = {
    auto_skip: false,
    disable_numpad: false,
    maximize_on_double_click: true,
    fast_backward_buttons: '30,10',
    fast_forward_buttons: '30,90',
    header_on_hover: true,
    hide_dim_screen: false,
    hide_skip_button: false,
    hide_subtitles: false,
    hide_ui: '',
    open_header_menu_on_hover: false,
    player_mode: 2,
    runnerThumbnail: '',
    scrollbar: false,
    shortcuts: this.NESTED,
    skip_event_credits: 1,
    skip_event_intro: 1,
    skip_event_preview: 1,
    skip_event_recap: 1,
    theater_mode: true,
    anilist_link: '',
    myanimelist_link: ''
  };
  CHROME_STORAGE_NESTED = {
    shortcuts: {
      backward: {
        'ctrl||ArrowLeft': 10,
        'shift||ArrowLeft': 30,
      },
      forward: {
        'ctrl||ArrowRight': 30,
        'shift||ArrowRight': 90,
      },
      speedUp: {
        'shift||Comma': 0.25,
      },
      speedDown: {
        'shift||KeyM': 0.25,
      },
      skip: 'Enter',
    },
  };
  ATTRIBUTES = new (class extends Set {
    add(value) {
      document.documentElement.setAttribute(this.toAttributeName(value), chromeStorage[value]);
      return super.add(value);
    }

    delete(value) {
      document.documentElement.removeAttribute(this.toAttributeName(value));
      return super.delete(value);
    }

    toAttributeName(value) {
      return `ic_${value}`;
    }
  })();
  LOADED = new Promise((resolve) => {
    chrome.storage.local.get(this.CHROME_STORAGE, (items) => {
      Object.keys(this.CHROME_STORAGE).forEach((key) => {
        this.__defineGetter__(key, () => items[key]);
        this.__defineSetter__(key, (value) => {
          chrome.storage.local.set({ [key]: value });
        });
      });

      Object.entries(this.CHROME_STORAGE_NESTED).forEach(([key, defaultValue]) => {
        if (items[key] === this.NESTED) {
          items[key] = defaultValue;
        }
      });

      chrome.storage.onChanged.addListener((changes) => {
        Object.entries(changes).forEach(([key, storageChange]) => {
          if (storageChange.newValue === this.NESTED && this.CHROME_STORAGE_NESTED[key]) {
            items[key] = this.CHROME_STORAGE_NESTED[key];
          } else {
            items[key] = storageChange.newValue;
          }
          if (this.ATTRIBUTES.has(key)) {
            this.ATTRIBUTES.add(key);
          }
        });
      });

      resolve();
    });
  });

  reload(...attributes) {
    this.LOADED.then(() => {
      attributes.forEach((attribute) => {
        if (!this.ATTRIBUTES.has(attribute)) {
          this.ATTRIBUTES.add(attribute);
        }
      });
      this.ATTRIBUTES.forEach((attribute) => {
        if (!attributes.includes(attribute)) {
          this.ATTRIBUTES.delete(attribute);
        }
      });
    });
  }

  backup(callback) {
    chrome.storage.local.get(this.CHROME_STORAGE, (result) => {
      chrome.storage.sync.set(result, callback);
    });
  }

  restore(callback) {
    chrome.storage.sync.get(this.CHROME_STORAGE, (result) => {
      chrome.storage.local.set(result, callback);
    });
  }

  reset(callback) {
    chrome.storage.local.set(this.CHROME_STORAGE, callback);
  }
})();
