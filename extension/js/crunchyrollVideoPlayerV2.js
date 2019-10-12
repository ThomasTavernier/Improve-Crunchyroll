// This code is to be inserted in "https://static.crunchyroll.com/vilos-v2/web/vilos/player.html", it's the iframe of "https://www.crunchyroll.com/*" video player
// It will create and insert buttons in the video player so that we can move forward or backward

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

function createButtons() {
    const backList = [30, 10];
    const skipList = [30, 90];
    let buttonList = [];
    for (let backNumber of backList) {
        let backButton = document.createElement("div");
        backButton.innerHTML = "«" + backNumber;
        backButton.id = backNumber;
        backButton.title = "back " + backNumber + "s";
        backButton.addEventListener("click", back);
        buttonList.push(backButton);
    }
    for (let skipNumber of skipList) {
        let skipButton = document.createElement("div");
        skipButton.innerHTML = skipNumber + "»";
        skipButton.id = skipNumber;
        skipButton.title = "skip " + skipNumber + "s";
        skipButton.addEventListener("click", skip);
        buttonList.push(skipButton);
    }
    for (let button of buttonList) {
        button.className += 'CBP_buttons';
        CBP_div.appendChild(button);
    }
}

function createDiv() {
    CBP_div = document.createElement('div');
    CBP_div.id = 'CBP_div';
    // all class = 'css-1dbjc4n r-1awozwy r-1loqt21 r-13awgt0 r-18u37iz r-1pi2tsx r-1otgn73'
    CBP_div.className = 'css-1dbjc4n r-1awozwy r-18u37iz r-1pi2tsx';
    createButtons();
}

const callback = function test(mutationsList) {
    if (mutationsList[1] !== undefined) {
        const node = mutationsList[1].addedNodes[0];
        if (node.style.opacity !== '') {
            if (node.children[0].children[1] !== undefined) {
                node.children[0].children[1].children[2].children[0].appendChild(CBP_div);
            } else {
                node.children[0].children[0].children[2].children[0].appendChild(CBP_div);
            }
        }
    }
};

function init() {
    createDiv();
    const observer = new MutationObserver(callback);
    observer.observe(document.getElementById('vilosRoot'), {
        childList: true
    });
}

let CBP_div;

init();
