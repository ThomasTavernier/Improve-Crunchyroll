// This code is to be inserted in "https://static.crunchyroll.com/vilos/player.html", it's the iframe of "https://www.crunchyroll.com/*" video player
// It will create and insert buttons in the video player so that we can move forward or backward

// back X seconds
function back(evt) {
    let video = document.getElementById("player_html5_api");
    video.currentTime = video.currentTime - parseInt(evt.target.id);
}

// skip X seconds
function skip(evt) {
    let video = document.getElementById("player_html5_api");
    video.currentTime = video.currentTime + parseInt(evt.target.id);
}

// insert buttonns
function insertButtons() {
    let backList = [30, 10];
    let skipList = [30, 90];
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
        button.className += "MIB_button vjs-time-control";
        document.getElementsByClassName("vjs-control-bar")[0].appendChild(button);
    }
}

function init() {
    recursionCounter++;
    if (document.getElementsByClassName("vjs-control-bar")[0].children.length >= 17 || recursionCounter === maxRecursion) {
        // insert buttonns
        setTimeout(insertButtons);
    } else {
        // retry in 100ms
        setTimeout(init, 100);
    }
}

let recursionCounter = 0;
const maxRecursion = 10;
setTimeout(init);