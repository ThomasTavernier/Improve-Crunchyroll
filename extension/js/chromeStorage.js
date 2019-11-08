const CHROME_STORAGE = {
    'player_mode': 2,
    'theater_mode': true,
    'header_on_hover': true,
    'fast_backward_buttons': '30,10',
    'fast_forward_buttons': '30,90',
    'hide_banner': true,
    'hide_message_box': true
};

const INPUTS_CHECKBOX = ['header_on_hover', 'hide_banner', 'hide_message_box']
const ATTRIBUTES = ['player_mode', 'theater_mode', ...INPUTS_CHECKBOX];
const INPUTS_TEXT = ['fast_backward_buttons', 'fast_forward_buttons'];

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