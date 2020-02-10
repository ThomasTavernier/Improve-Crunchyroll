const core = new class {
    main = {};
    components = {};

    translate(key) {
        let label = chrome.i18n.getMessage(key);
        return label !== '' ? label : key;
    }
};