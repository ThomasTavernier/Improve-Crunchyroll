var style = document.createElement('style');
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
	if (document.getElementById("main_content").contains(document.getElementById("showmedia_video"))) {
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
			display: none !important;
		}
		.showmedia-header:first-child {
			display: none !important;
		}
		.html5-video-player {
			width: 100% !important;
			height: 100% !important;
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

// unset style function
function unsetStyle() {
	style.innerHTML = ``
}

// toggle video player
function toggle() {
	// if large && in video page
	if (document.getElementById("main_content").className == "left" && document.getElementsByClassName("showmedia-trail cf")[0] != undefined) {
		// set style
		setStyleAsBiggerPlayer();
	}
	else {
		// unset style
		unsetStyle();
	}
	// refresh
	setTimeout(refresh);
}

// togglerecursion function
function toggleRecursion() {
	// if page is load
	if (document.getElementById("main_content") != null) {
		// laucnh cinema/normal switch function
		setTimeout(toggle);
	}
	else {
		// retry in 100ms
		setTimeout(toggleRecursion, 100);
	}
}

// set focus without crunchyrollHTML5 function
function setFocusWithoutCrunchyrollHTML5() {
	document.getElementById("showmedia_video_player").firstChild.focus();
}

// set focus function
function setFocus() {
	// if Crunchyroll HTML5 extension is installed
	if (document.getElementById("showmedia_video_box_wide") != null) {
		// set focus 
		document.getElementById("showmedia_video_box_wide").firstChild.focus();
	} else {
		// set focus without crunchyrollHTML5 in 250ms
		setTimeout(setFocusWithoutCrunchyrollHTML5, 250);
	}
}

// init
function init() {
	// add styleshett to document
	document.head.appendChild(style);
	// remove ads
	setTimeout(removeAds);
	// if Crunchyroll HTML5 extension is installed
	if (document.getElementsByClassName("chrome-button chrome-size-button")[0] != undefined) {
		// add an event listener on size button
		document.getElementsByClassName("chrome-button chrome-size-button")[0].addEventListener("click", toggleRecursion);
	}
	setTimeout(toggleRecursion);
	// set focus to the video player
	setTimeout(setFocus);
}

// START
chrome.storage.sync.get(['isCrunchyrollOff'], function (result) {
	// if crunchyroll on
	if (!result.isCrunchyrollOff) {
		// lauch
		init();
	}
});
