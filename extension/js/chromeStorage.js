const CHROME_STORAGE = {
    'fast_backward_buttons': '30,10',
    'fast_forward_buttons': '30,90',
    'header_on_hover': true,
    'hide_banner': true,
    'hide_message_box': true,
    'player_mode': 2,
    'scrollbar': false,
    'theater_mode': true,
};

const INPUTS_CHECKBOX = ['header_on_hover', 'hide_banner', 'hide_message_box']
const VIDEO_PLAYER_ATTRIBUTES = ['player_mode', 'scrollbar'];
const ATTRIBUTES = [...VIDEO_PLAYER_ATTRIBUTES, ...INPUTS_CHECKBOX];
const INPUTS_TEXT = ['fast_backward_buttons', 'fast_forward_buttons'];

let chromeStorage = {};
let chromeStorageInit = undefined;

function chromeStorageGet() {
    chrome.storage.local.get(CHROME_STORAGE, function (data) {
        chromeStorage = data;
        if (chromeStorageInit !== undefined) chromeStorageInit();
    });
}

chrome.storage.local.onChanged.addListener(() => {
    chromeStorageGet();
});

chromeStorageGet();