let chromeStorage = {};
let chromeStorageInit = undefined;

function chromeStorageGet() {
    chrome.storage.local.get(CHROME_STORAGE, function (data) {
        chromeStorage = data;
        if (chromeStorageInit !== undefined) {
            chromeStorageInit();
        };
    });
}

chrome.storage.local.onChanged.addListener(() => {
    chromeStorageGet();
});

chromeStorageGet();