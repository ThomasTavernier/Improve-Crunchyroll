var ratio = window.screen.availHeight / window.screen.availWidth;

// remove Ads
function removeAds() {
    var styleSheetRemoveAds = document.createElement('style');
    styleSheetRemoveAds.innerHTML = `
		.header-promo-ribbon-wrap {
			display: none;
        }
        #main {
            margin-top: 75px !important;
        }
	`
    document.head.appendChild(styleSheetRemoveAds);
}

// set style as bigger player function
function setStyleAsBiggerPlayer() {
    var style = document.createElement('style');
    document.head.appendChild(style);
    if (document.getElementById("player") !== null) {
        style.innerHTML = `
        #main {
            margin: 0 !important;
        }
        #funimation-main-site-header {
			opacity: 0;
			z-index: 9000;
			width: 100%;
			transition: opacity 0.8s;
		}
		#funimation-main-site-header:hover {
			opacity: 1;
			transition: opacity 0.4s;
        }
        .video-player-section .container {
            height: calc((` + ratio + `) * 100vw);;
			background-color: black !important;
			width: 100% !important;
			max-height: 100vh !important;
        }
        .video-player-section .container .row {
            height: 100%;
        }
        .video-player-container{
            height: 100% !important;
        }
        `
    }
}

// init
function init() {
    // remove ads
    setTimeout(removeAds);
    // set big player
    setTimeout(setStyleAsBiggerPlayer);
}

// START
chrome.storage.sync.get(['isFunimationOff'], function (result) {
    // if crunchyroll on
    if (!result.isFunimationOff) {
        // lauch
        init();
    }
});
