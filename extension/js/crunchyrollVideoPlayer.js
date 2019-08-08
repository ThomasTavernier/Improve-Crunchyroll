// This code is to be inserted in "https://static.crunchyroll.com/vilos/player.html", it's the iframe of "https://www.crunchyroll.com/*" video player
// It will create and insert buttons in the video player so that we can move forward or backward

// back X seconds
function back(evt) {
    var video = document.getElementById("player_html5_api");
    video.currentTime = video.currentTime - parseInt(evt.target.id);
}

// skip X seconds
function skip(evt) {
    var video = document.getElementById("player_html5_api");
    video.currentTime = video.currentTime + parseInt(evt.target.id);
}

// insert buttonns
function insertButtons() {
    var backList = [30, 10];
    var skipList = [30, 90];
    var buttonList = [];
    for (backNumber of backList) {
        var backButton = document.createElement("div");
        backButton.innerHTML = "«" + backNumber;
        backButton.id = backNumber;
        backButton.title = "back " + backNumber + "s";
        backButton.addEventListener("click", back);
        buttonList.push(backButton);
    }

    for (skipNumber of skipList) {
        var skipButton = document.createElement("div");
        skipButton.innerHTML = skipNumber + "»";
        skipButton.id = skipNumber;
        skipButton.title = "skip " + skipNumber + "s";
        skipButton.addEventListener("click", skip);
        buttonList.push(skipButton);
    }

    for (button of buttonList) {
        button.className += "MIB_button vjs-time-control";
        document.getElementsByClassName("vjs-control-bar")[0].appendChild(button);
    }
}

function init() {
    // insert buttonns
    setTimeout(insertButtons);
}

setTimeout(init);