// check if Crunchyroll activate
checkCrunchyroll = function () {
	chrome.storage.sync.get(['isCrunchyrollOff'], function (result) {
		if (result.isCrunchyrollOff) {
			document.getElementById("crunchyroll").className = "buttonOFF";
		}
		else {
			document.getElementById("crunchyroll").className = "buttonON";
		}
	});
}

// check if Gogoanime activate
checkGogoanime = function () {
	chrome.storage.sync.get(['isGogoanimeOff'], function (result) {
		if (result.isGogoanimeOff) {
			document.getElementById("gogoanime").className = "buttonOFF";
		}
		else {
			document.getElementById("gogoanime").className = "buttonON";
		}
	});
}

// check if Youtube activate
checkYouyube = function () {
	chrome.storage.sync.get(['isYoutubeOff'], function (result) {
		if (result.isYoutubeOff) {
			document.getElementById("youtube").className = "buttonOFF";
		}
		else {
			document.getElementById("youtube").className = "buttonON";
		}
	});
}

// toggle Crunchyroll
toggleCrunchyroll = function () {
	chrome.storage.sync.get(['isCrunchyrollOff'], function (result) {
		chrome.storage.sync.set({ "isCrunchyrollOff": !result.isCrunchyrollOff });
	});
	setTimeout(checkCrunchyroll);
}

// toggle Gogoanime
toggleGogoanime = function () {
	chrome.storage.sync.get(['isGogoanimeOff'], function (result) {
		chrome.storage.sync.set({ "isGogoanimeOff": !result.isGogoanimeOff });
	});
	setTimeout(checkGogoanime);
}

// toggle Youtube
toggleYoutube = function () {
	chrome.storage.sync.get(['isYoutubeOff'], function (result) {
		chrome.storage.sync.set({ "isYoutubeOff": !result.isYoutubeOff });
	});
	setTimeout(checkYouyube);
}

// reset storage
resetdefaults = function () {
	chrome.storage.sync.clear();
	checkCrunchyroll();
	checkGogoanime();
	checkYouyube();
}

// init
init = function () {
	checkCrunchyroll();
	checkGogoanime();
	checkYouyube();
	document.getElementById("crunchyroll").addEventListener("click", toggleCrunchyroll);
	document.getElementById("gogoanime").addEventListener("click", toggleGogoanime);
	document.getElementById("youtube").addEventListener("click", toggleYoutube);
	document.getElementById("reset").addEventListener("click", resetdefaults);
}

// launch script
setTimeout(init);
