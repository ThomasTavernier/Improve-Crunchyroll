const chromeStorage = new class {

    constructor() {
        const CHROME_STORAGE = {
            fast_backward_buttons: "30,10",
            fast_forward_buttons: "30,90",
            header_on_hover: true,
            hide_banner: true,
            hide_message_box: true,
            player_mode: 2,
            scrollbar: false,
            theater_mode: true,
            theme: 0
        };
        let chromeStorage;

        Object.keys(CHROME_STORAGE).forEach(key => {
            this.__defineGetter__(key, () => chromeStorage[key]);
            this.__defineSetter__(key, value => {
                let obj = {};
                obj[key] = value;
                chrome.storage.local.set(obj);
            });
        });

        chrome.storage.local.get(CHROME_STORAGE, items => {
            chromeStorage = items;
            const ATTRIBUTES = (location => {
                switch (location) {
                    case "https://www.crunchyroll.com":
                        return [
                            "header_on_hover",
                            "hide_banner",
                            "hide_message_box",
                            "player_mode",
                            "scrollbar",
                            "theme",
                        ];
                    case "https://static.crunchyroll.com":
                        return [
                            "player_mode",
                            "scrollbar",
                        ];
                    case `chrome-extension://${chrome.runtime.id}`:
                        return [
                            "theme",
                        ];
                    default:
                        return Object.keys(CHROME_STORAGE);
                }
            })(window.location.href);

            ATTRIBUTES.forEach(attribute => {
                document.documentElement.setAttribute(
                    `cbp_${attribute}`,
                    chromeStorage[attribute]
                );
            });

            chrome.storage.local.onChanged.addListener(changes => {
                Object.entries(changes).forEach(([key, storageChange]) => {
                    if (storageChange.newValue !== storageChange.oldValue) {
                        chromeStorage[key] = storageChange.newValue;
                        if (ATTRIBUTES.includes(key)) {
                            document.documentElement.setAttribute(
                                "cbp_" + key,
                                chromeStorage[key]
                            );
                        }
                    }
                });
            });
        });
    }
};