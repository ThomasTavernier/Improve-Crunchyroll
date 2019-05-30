var style = document.createElement('style');

// refresh function
function refresh() {
	window.dispatchEvent(new Event("resize"));
}

// set style as bigger player function
function setStyleAsBiggerPlayer() {
	style.innerHTML = `
    #page-manager {
		margin-top: 0 !important;
	}
	#player-theater-container {
		max-height: 100vh !important;
	}
	#masthead-container {
		display: none !important;
	}
`
}

// unset style function
function unsetStyle() {
	style.innerHTML = ``;
}

// toggle function
function toggle() {
	// if large && in video page
	if (document.getElementById("player-theater-container").children[0] != undefined && document.getElementById("player-container").offsetHeight > 0) {
		// set style
		setTimeout(setStyleAsBiggerPlayer);
	}
	else {
		// unset style
		setTimeout(unsetStyle);
	}
	// refresh
	setTimeout(refresh);
}

// toggle recursion function
function toggleRecursion() {
	// if page is load
	if (document.getElementById("player-theater-container") != null) {
		// laucnh cinema/normal switch function
		setTimeout(toggle);
	}
	else {
		// retry in 250ms
		setTimeout(toggleRecursion, 250);
	}
}

// add event listener on cinama/normal switch recursion function
function addEventListenerOnCinemaNormalSwitchRecursion() {
	// if cinama/normal switch exist
	if (document.getElementsByClassName("ytp-size-button ytp-button")[0] != undefined) {
		// add event listener cinama/normal switch
		document.getElementsByClassName("ytp-size-button ytp-button")[0].addEventListener("click", function () { setTimeout(toggleRecursion, 1) });
	}
	else {
		// retry in 250ms
		setTimeout(addEventListenerOnCinemaNormalSwitchRecursion, 250);
	}
}

// init function
function init() {
	// add event listener on url change
	window.addEventListener("yt-page-data-updated", function () { setTimeout(toggleRecursion) });
	// add styleshett to document
	document.head.appendChild(style);
	// verif if the current page is a video
	setTimeout(toggleRecursion);
	// laucnh add event listener on cinama/normal switch recursion function
	setTimeout(addEventListenerOnCinemaNormalSwitchRecursion);
}

// START
chrome.storage.sync.get(['isYoutubeOff'], function (result) {
	// if youtube on
	if (!result.isYoutubeOff) {
		// lauch
		init();
	}
});

