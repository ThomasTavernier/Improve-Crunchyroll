var ratio = window.screen.availHeight / window.screen.availWidth;
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

// remove Ads
function removeAds() {
    var styleSheetRemoveAds = document.createElement('style');
    styleSheetRemoveAds.innerHTML = `
		#marketApp {
			display: none !important;
        }
	`
    document.head.appendChild(styleSheetRemoveAds);
}


function setWidth() {
    var width = document.body.clientWidth;
    document.getElementById("rmpPlayer").style.width = width + "px";
}

// set style as bigger player function
function setStyleAsBiggerPlayer() {
    var style = document.createElement('style');
    document.head.appendChild(style);
    if (document.getElementById("videoArea") !== null) {
        style.innerHTML = `
        .navbar-fixed-top {
			opacity: 0;
			z-index: 1;
			width: 80%;
            margin: auto;
			transition: opacity 0.8s;
		}
		.navbar-fixed-top:hover {
			opacity: 1;
			transition: opacity 0.4s;
        }
        .top-page-offset {
            padding-top: 0 !important;
        }
        #rmpPlayer {
            height: calc((` + ratio + `) * 100vw) !important;
			background-color: black !important;
            max-height: 100vh !important;
            left: 50%;
            transform: translateX(-50%);
        }
        `
        setTimeout(setWidth, 250);
        window.addEventListener("resize", function () { setWidth(); setTimeout(setWidth, 100) });
        var toFix = document.getElementsByClassName("body-bg-color top-page-offset")[0];
        toFix.innerHTML = toFix.innerHTML.replace("﻿", "");
    }
}

// set focus without crunchyrollHTML5 function
function setFocus() {
    if (document.getElementById("videoArea") !== null) {
        document.getElementById("rmpPlayer").focus();
    }
}

// init
function init() {
    // remove ads
    setTimeout(removeAds);
    // set big player
    setTimeout(setStyleAsBiggerPlayer);
    // set focus to the video player
    setTimeout(setFocus, 250);
}

// START
chrome.storage.sync.get(['isHidiveOff'], function (result) {
    // if crunchyroll on
    if (!result.isHidiveOff) {
        // lauch
        init();
    }
});
