let syncTiemout;

function sync() {
    clearTimeout(syncTiemout);
    syncTiemout = setTimeout(() => {
        chrome.storage.local.get(CHROME_STORAGE, function (data) {
            console.log(data);
            chrome.storage.sync.set(data);
        });
    }, 500);
}

chrome.storage.sync.get(CHROME_STORAGE, function (data) {
    chrome.storage.local.set(data);
});

chrome.storage.onChanged.addListener(() => {
    sync();
});