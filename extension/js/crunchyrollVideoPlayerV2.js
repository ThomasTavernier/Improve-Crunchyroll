// This code is to be injected in "https://static.crunchyroll.com/vilos-v2/web/vilos/player.html", it's the video player iframe of "https://www.crunchyroll.com/*"

function back(ev) {
    const videoPlayer = document.getElementById("player0");
    videoPlayer.currentTime -= parseInt(ev.target.id);
    videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
}

function skip(ev) {
    const videoPlayer = document.getElementById("player0");
    videoPlayer.currentTime += parseInt(ev.target.id);
    videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
}

function parseNumber(number) {
    let numberMinutes = Math.floor(number / 60);
    let numberSeconds = number - numberMinutes * 60;
    return numberMinutes > 0 ? numberMinutes + ':' + (numberSeconds < 10 ? numberSeconds = '0' + numberSeconds : numberSeconds) : numberSeconds;
}

function createButtons() {
    let backList = chromeStorage.previous_buttons.split(',');
    let skipList = chromeStorage.skip_buttons.split(',');

    let buttonList = [];
    for (let backNumber of backList) {
        if (!isNaN(parseInt(backNumber))) {
            let backButton = document.createElement("div");
            backButton.innerHTML = "«" + parseNumber(backNumber);
            backButton.id = backNumber;
            backButton.title = "back " + parseNumber(backNumber);
            backButton.addEventListener("click", back);
            buttonList.push(backButton);
        }
    }
    for (let skipNumber of skipList) {
        if (!isNaN(parseInt(skipNumber))) {
            let skipButton = document.createElement("div");
            skipButton.innerHTML = parseNumber(skipNumber) + "»";
            skipButton.id = skipNumber;
            skipButton.title = "skip " + parseNumber(skipNumber);
            skipButton.addEventListener("click", skip);
            buttonList.push(skipButton);
        }
    }
    for (let button of buttonList) {
        button.className += 'cbp_buttons';
        cbp_div.appendChild(button);
    }
}

function createDiv() {
    cbp_div = document.createElement('div');
    cbp_div.id = 'cbp_div';
    // all class = 'css-1dbjc4n r-1awozwy r-1loqt21 r-13awgt0 r-18u37iz r-1pi2tsx r-1otgn73'
    cbp_div.className = 'css-1dbjc4n r-1awozwy r-18u37iz r-1pi2tsx';
    createButtons();
}

const callback = function (mutationsList) {
    if (mutationsList[1] !== undefined) {
        const node = mutationsList[1].addedNodes[0];
        if (node.style.opacity !== '') {
            if (node.children[0].children[1] !== undefined) {
                node.children[0].children[1].children[2].children[0].appendChild(cbp_div);
            } else {
                node.children[0].children[0].children[2].children[0].appendChild(cbp_div);
            }
        }
    }
};

function init() {
    new MutationObserver(callback).observe(document.getElementById('vilosRoot'), {
        childList: true
    });
};

let cbp_div;

setTimeout(init);

chromeStorageInit = function () {
    createDiv();
};