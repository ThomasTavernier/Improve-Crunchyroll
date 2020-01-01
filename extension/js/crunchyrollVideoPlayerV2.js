// This code is to be injected in 'https://static.crunchyroll.com/vilos-v2/web/vilos/player.html', it's the video player iframe of 'https://www.crunchyroll.com/*'

function resumePlayerState() {
    const videoPlayer = document.getElementById('player0');
    videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
}

function fastBackward(ev) {
    const videoPlayer = document.getElementById('player0');
    videoPlayer.currentTime -= parseInt(ev.target.id);
    resumePlayerState();
}

function fastForward(ev) {
    const videoPlayer = document.getElementById('player0');
    videoPlayer.currentTime += parseInt(ev.target.id);
    resumePlayerState();
}

function parseNumber(number) {
    let numberMinutes = Math.floor(number / 60);
    let numberSeconds = number - numberMinutes * 60;
    return numberMinutes > 0 ? `${numberMinutes}:${numberSeconds < 10 ? '0' + numberSeconds : numberSeconds}` : numberSeconds;
}

function createFastForwardBackwardButtons() {
    let fastBackwardList = chromeStorage.fast_backward_buttons.split(',');
    let fastForwardList = chromeStorage.fast_forward_buttons.split(',');

    let buttonList = [];
    fastBackwardList.forEach(fastBackwardNumber => {
        let fastBackwardButton = document.createElement('div');
        const number = parseNumber(fastBackwardNumber);
        fastBackwardButton.innerHTML = `«${number}`;
        fastBackwardButton.id = fastBackwardNumber;
        fastBackwardButton.title = `${chrome.i18n.getMessage('KEY_FAST_BACKWARD')} ${number}`
        fastBackwardButton.addEventListener('click', fastBackward);
        buttonList.push(fastBackwardButton);
    });
    fastForwardList.forEach(fastForwardNumber => {
        let fastForwardButton = document.createElement('div');
        const number = parseNumber(fastForwardNumber);
        fastForwardButton.innerHTML = `${number}»`;
        fastForwardButton.id = fastForwardNumber;
        fastForwardButton.title = `${chrome.i18n.getMessage('KEY_FAST_FORWARD')} ${number}`
        fastForwardButton.addEventListener('click', fastForward);
        buttonList.push(fastForwardButton);
    });
    buttonList.forEach(button => {
        button.className += 'cbp_buttons';
        cbp_div_player_controls.appendChild(button);
    });
}

function createDivs() {
    cbp_div_player_controls = document.createElement('div');
    cbp_div_player_mode = document.createElement('div');

    // all class = 'css-1dbjc4n r-1awozwy r-1loqt21 r-13awgt0 r-18u37iz r-1pi2tsx r-1otgn73'
    [cbp_div_player_controls, cbp_div_player_mode].forEach(div => div.className = 'cbp_div css-1dbjc4n r-1awozwy r-18u37iz r-1pi2tsx');

    createPlayerButton();
    createFastForwardBackwardButtons();
}

function switchClassForEvent(ev) {
    const ON = ' on';
    if (ev.target.className.includes(ON)) ev.target.className = ev.target.className.replace(ON, '');
    else ev.target.className += ON;
}

function resumePlayerSwitchClassAndSetChromeStorage(ev, obj) {
    resumePlayerState();
    switchClassForEvent(ev);
    chrome.storage.local.set(obj);
}

function scrollBarChange(ev) {
    resumePlayerSwitchClassAndSetChromeStorage(ev, {
        scrollbar: chromeStorage.scrollbar ? false : true,
    });
}

function playerMode1Change(ev) {
    resumePlayerSwitchClassAndSetChromeStorage(ev, {
        theater_mode: !chromeStorage.theater_mode,
        player_mode: chromeStorage.player_mode === 0 || chromeStorage.player_mode === 1 ? !chromeStorage.theater_mode ? 1 : 0 : chromeStorage.player_mode,
    });
}


function playerMode2Change(ev) {
    resumePlayerSwitchClassAndSetChromeStorage(ev, {
        player_mode: (chromeStorage.player_mode === 2 ? 0 : 2) === 2 ? 2 : chromeStorage.theater_mode ? 1 : 0,
    });
}

function createPlayerButton() {
    [{
            className: 'scrollbar',
            chromeStorageKey: 'scrollbar',
            title: 'KEY_SCROLLBAR',
            onChange: scrollBarChange,
        },
        {
            className: 'theater_mode',
            chromeStorageKey: 'theater_mode',
            title: 'KEY_THEATER_MODE',
            onChange: playerMode1Change,
        },
        {
            className: 'fullscreen_mode',
            chromeStorageKey: 'player_mode',
            eq: 2,
            title: 'KEY_FULLSCREEN_MODE',
            onChange: playerMode2Change,
        },
    ].forEach(button => {
        let span = document.createElement('span');
        span.className = `cbp_buttons ${button.className} ${chromeStorage[button.chromeStorageKey] === true || button.eq && chromeStorage[button.chromeStorageKey] === button.eq ? 'on' : ''}`;
        span.title = chrome.i18n.getMessage(button.title);
        span.addEventListener('click', button.onChange);
        cbp_div_player_mode.appendChild(span);
    });
}

function insertCbpDivs(vilosControlsContainer) {
    if (vilosControlsContainer.style.opacity !== '') {
        const overlay = vilosControlsContainer.children[0];
        const controlsBar = overlay.children[overlay.children[1] !== undefined ? 1 : 0].children[2];
        controlsBar.children[0].appendChild(cbp_div_player_controls);
        controlsBar.children[1].insertBefore(cbp_div_player_mode, controlsBar.children[1].children[1]);
    }
}

function fixSubsHeight() {
    document.getElementById('vilosRoot').style.width = '99.9%';
    setTimeout(() => {
        if (this.innerHeight !== document.getElementById('velocity-canvas').height) document.getElementById('vilosRoot').style.width = '';
    }, 100);
}

function init() {
    if (document.getElementById('velocity-controls-package') !== null) {
        new MutationObserver((mutationsList) => {
                insertCbpDivs(mutationsList[1].addedNodes[0]);
            })
            .observe(document.getElementById('velocity-controls-package'), {
                childList: true
            });
        new MutationObserver((mutationsList, observer) => {
                observer.disconnect();
                if (this.innerHeight !== document.getElementById('velocity-canvas').height) fixSubsHeight();
            })
            .observe(document.getElementById('velocity-overlay-package'), {
                childList: true
            });
        insertCbpDivs(document.getElementById('vilosControlsContainer'));
    } else {
        setTimeout(() => {
            init();
        }, 100);
    }
}

let cbp_div_player_controls;
let cbp_div_player_mode;

setTimeout(init);

chromeStorageInit = function () {
    createDivs();
};