var ratio = window.screen.availHeight / window.screen.availWidth;

// refresh function
function refresh() {
	window.dispatchEvent(new Event("resize"));
}

// remove Ads
function removeAds() {
	var styleSheetRemoveAds = document.createElement('style');
	styleSheetRemoveAds.innerHTML = `
		#message_box {
			display: none !important;
		}
		.cr-expo-banner {
			display: none !important;
		}
		body {
			background-image: none !important;
			background: none !important;
		}
		#template_skin_leaderboard {
			height: 0 !important;
		}
		#template_skin_splashlink {
			pointer-events: none !important;
		}
		.__web-inspector-hide-shortcut__ {
			pointer-events: none !important;
		}
	`
	document.head.appendChild(styleSheetRemoveAds);
}

// set style as bigger player function
function setStyleAsBiggerPlayer() {
	var style = document.createElement('style');
	document.head.appendChild(style);
	if (document.getElementById("main_content") !== null) {
		if(document.getElementById("showmedia_video_box") !== null) {
			document.getElementsByClassName("showmedia-trail cf")[0].appendChild(document.getElementById("showmedia_video"));
			document.getElementById("showmedia_video_box").id = "showmedia_video_box_wide";
		}
		style.innerHTML = `
		#showmedia, #footer {
			width: 960px !important;
			margin: 0 auto !important;
		}
		#showmedia_video {
			height: calc((` + ratio + `) * 100vw);;
			background-color: black !important;
			width: 100% !important;
			min-width: 960px !important;
			min-height: 540px !important;
			max-height: 100vh !important;
		}
		#showmedia_video_box_wide {
			width: 100% !important;
			height: 100% !important;
		}
		#template_scroller {
			padding-top: 0px !important;
		}
		#template_container {
			padding: 0px !important;
			width: 100% !important;
		}
		#header_beta {
			opacity: 0;
			position: absolute;
			z-index: 3;
			width: 100%;
			transition: opacity 0.8s;
		}
		#header_beta:hover {
			opacity: 1;
			transition: opacity 0.4s;
		}
		.showmedia-header:first-child {
			display: none !important;
		}
		#vilos-player {
			width: calc(100% + 3px) !important;
			height: calc(100% + 1px) !important;
			margin-left: -3px !important;
			margin-top: -1px !important;
		}
		#showmedia_video_player {
			overflow: hidden !important;
		}
		`
	}
	// .html5-video-player {
	// 	width: 100% !important;
	// 	height: 100% !important;
	// }
}

// set focus without crunchyrollHTML5 function
function setFocus() {
	if (document.getElementById("showmedia_video_player") !== null) {
		document.getElementById("showmedia_video_player").firstChild.focus();
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
chrome.storage.sync.get(['isCrunchyrollOff'], function (result) {
	// if crunchyroll on
	if (!result.isCrunchyrollOff) {
		// lauch
		init();
	}
});
