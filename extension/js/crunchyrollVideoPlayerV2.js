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
    return numberMinutes > 0 ? numberMinutes + ':' + (numberSeconds < 10 ? numberSeconds = 0 + numberSeconds : numberSeconds) : numberSeconds;
}

function createFastForwardBackwardButtons() {
    let fastBackwardList = chromeStorage.fast_backward_buttons.split(',');
    let fastForwardList = chromeStorage.fast_forward_buttons.split(',');

    let buttonList = [];
    for (let fastBackwardNumber of fastBackwardList) {
        if (!isNaN(parseInt(fastBackwardNumber))) {
            let fastBackwardButton = document.createElement('div');
            fastBackwardButton.innerHTML = '«' + parseNumber(fastBackwardNumber);
            fastBackwardButton.id = fastBackwardNumber;
            fastBackwardButton.title = 'fast backward ' + parseNumber(fastBackwardNumber);
            fastBackwardButton.addEventListener('click', fastBackward);
            buttonList.push(fastBackwardButton);
        }
    }
    for (let fastForwardNumber of fastForwardList) {
        if (!isNaN(parseInt(fastForwardNumber))) {
            let fastForwardButton = document.createElement('div');
            fastForwardButton.innerHTML = parseNumber(fastForwardNumber) + '»';
            fastForwardButton.id = fastForwardNumber;
            fastForwardButton.title = 'fast forward ' + parseNumber(fastForwardNumber);
            fastForwardButton.addEventListener('click', fastForward);
            buttonList.push(fastForwardButton);
        }
    }
    for (let button of buttonList) {
        button.className += 'cbp_buttons';
        cbp_div_player_controls.appendChild(button);
    }
}

function createDivs() {
    cbp_div_player_controls = document.createElement('div');
    cbp_div_player_mode = document.createElement('div');

    for (let div of [cbp_div_player_controls, cbp_div_player_mode]) {
        // all class = 'css-1dbjc4n r-1awozwy r-1loqt21 r-13awgt0 r-18u37iz r-1pi2tsx r-1otgn73'
        div.className = 'cbp_div css-1dbjc4n r-1awozwy r-18u37iz r-1pi2tsx';
    }

    createPlayerButton();
    createFastForwardBackwardButtons();
}

function switchPlayerMode(ev) {
    const ON = ' on';

    if (ev.target.className.includes(ON)) {
        ev.target.className = ev.target.className.replace(ON, '');
    } else {
        ev.target.className += ON;
    }

    resumePlayerState();
}

function playerMode1Change(ev) {
    let obj = {};

    obj.theater_mode = !chromeStorage.theater_mode;
    if (chromeStorage.player_mode === 0 || chromeStorage.player_mode === 1) {
        obj.player_mode = obj.theater_mode ? 1 : 0;
    }

    switchPlayerMode(ev);
    chrome.storage.local.set(obj);
}


function playerMode2Change(ev) {
    let obj = {};

    obj.player_mode = (chromeStorage.player_mode === 2 ? 0 : 2) === 2 ? 2 : chromeStorage.theater_mode ? 1 : 0;

    switchPlayerMode(ev);
    chrome.storage.local.set(obj);
}

function createPlayerButton() {
    let playerMode1 = document.createElement('span');
    playerMode1.className = 'cbp_buttons theater_mode' + (chromeStorage.theater_mode ? ' on' : '');
    playerMode1.title = 'theater mode';
    playerMode1.addEventListener('click', playerMode1Change);

    let playerMode2 = document.createElement('span');
    playerMode2.className = 'cbp_buttons fullscreen_mode' + (chromeStorage.player_mode === 2 ? ' on' : '');
    playerMode2.title = 'fullscreen in window mode';
    playerMode2.addEventListener('click', playerMode2Change);

    cbp_div_player_mode.appendChild(playerMode1);
    cbp_div_player_mode.appendChild(playerMode2);
}

function insertCbpDivs(vilosControlsContainer) {
    if (vilosControlsContainer.style.opacity !== '') {
        const overlay = vilosControlsContainer.children[0];
        const controlsBar = overlay.children[overlay.children[1] !== undefined ? 1 : 0].children[2];
        controlsBar.children[0].appendChild(cbp_div_player_controls);
        controlsBar.children[1].insertBefore(cbp_div_player_mode, controlsBar.children[1].children[1]);
    }
}

function init() {
    new MutationObserver((mutationsList) => {
            insertCbpDivs(mutationsList[1].addedNodes[0]);
        })
        .observe(document.getElementById('velocity-controls-package'), {
            childList: true
        });
    insertCbpDivs(document.getElementById('vilosControlsContainer'));
};

let cbp_div_player_controls;
let cbp_div_player_mode;

setTimeout(init);

chromeStorageInit = function () {
    createDivs();
};