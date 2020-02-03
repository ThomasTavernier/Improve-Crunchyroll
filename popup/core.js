const core = new class {
    main = {};
    components = {};

    constructor() {
        chromeStorage.chromeStorageInit = () => {
            chromeStorage.POPUP_ATTRIBUTES.forEach((attribute) => {
                document.documentElement.setAttribute('cbp_' + attribute, chromeStorage[attribute]);
            });
        };
    }

    translate(key) {
        let label = chrome.i18n.getMessage(key);
        return label !== '' ? label : key;
    }
};