function back(evt) {
    var video = document.getElementById("player_html5_api");
    video.currentTime = video.currentTime - parseInt(evt.target.id);
}

function skip(evt) {
    var video = document.getElementById("player_html5_api");
    video.currentTime = video.currentTime + parseInt(evt.target.id);
}

function insertDiv() {
    var backList = [30, 10];
    var skipList = [30, 90];
    var buttonList = [];
    for (backNumber of backList) {
        var backButton = document.createElement("div");
        backButton.innerHTML = "«" + backNumber;
        backButton.id = backNumber;
        backButton.title = "back " + backNumber +"s";
        backButton.addEventListener("click", back);
        buttonList.push(backButton);
    }

    for (skipNumber of skipList) {
        var skipButton = document.createElement("div");
        skipButton.innerHTML = skipNumber + "»";
        skipButton.id = skipNumber;
        skipButton.title = "skip " + skipNumber +"s";
        skipButton.addEventListener("click", skip);
        buttonList.push(skipButton);
    }

    for (button of buttonList) {
        button.className += "MIB_button vjs-time-control";
        document.getElementsByClassName("vjs-control-bar")[0].appendChild(button);
    }
}

function insertStyle() {
    var style = document.createElement("style");
    style.innerHTML = `
    .MIB_button {
        padding: 0 5px !important;
    }
    .vjs-duration {
        padding: 0 5px 0 0 !important;
    }
    .MIB_button:hover {
        color: coral !important;
        background-color: #131318;
    }
    `
    document.head.appendChild(style);
}

function init() {
    insertStyle();
    insertDiv();
    console.log(123);
}

init();