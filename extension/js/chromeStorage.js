const chromeStorage = new class {

    constructor() {
        this.chromeStorage = {};
        this.CHROME_STORAGE = {
            'fast_backward_buttons': '30,10',
            'fast_forward_buttons': '30,90',
            'header_on_hover': true,
            'hide_banner': true,
            'hide_message_box': true,
            'player_mode': 2,
            'scrollbar': false,
            'theater_mode': true,
            'theme': 0,
        };
        this.VIDEO_PLAYER_ATTRIBUTES = ['player_mode', 'scrollbar'];
        this.POPUP_ATTRIBUTES = ['theme'];
        this.ATTRIBUTES = ['header_on_hover', 'hide_banner', 'hide_message_box', ...this.POPUP_ATTRIBUTES, ...this.VIDEO_PLAYER_ATTRIBUTES];

        for (let key in this.CHROME_STORAGE) {
            this.__defineGetter__(key, () =>
                this.chromeStorage[key]
            );
            this.__defineSetter__(key, (value) => {
                let obj = {};
                obj[key] = value;
                chrome.storage.local.set(obj);
            });
        }

        chrome.storage.local.onChanged.addListener(() => {
            this.chromeStorageGet();
        });

        this.chromeStorageGet();
    }

    chromeStorageGet() {
        chrome.storage.local.get(this.CHROME_STORAGE, responseObject => {
            this.chromeStorage = responseObject;
            if (this.chromeStorageInit !== undefined) this.chromeStorageInit();
        });
    }
};