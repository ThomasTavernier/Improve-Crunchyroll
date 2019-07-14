// check if Crunchyroll activate
function checkCrunchyroll() {
	chrome.storage.sync.get(['isCrunchyrollOff'], function (result) {
		if (result.isCrunchyrollOff) {
			document.getElementById("crunchyroll").className = "buttonOFF";
		}
		else {
			document.getElementById("crunchyroll").className = "buttonON";
		}
	});
}

// check if Funimation activate
function checkFunimation() {
	chrome.storage.sync.get(['isFunimationOff'], function (result) {
		if (result.isFunimationOff) {
			document.getElementById("funimation").className = "buttonOFF";
		}
		else {
			document.getElementById("funimation").className = "buttonON";
		}
	});
}


// check if Gogoanime activate
function checkGogoanime() {
	chrome.storage.sync.get(['isGogoanimeOff'], function (result) {
		if (result.isGogoanimeOff) {
			document.getElementById("gogoanime").className = "buttonOFF";
		}
		else {
			document.getElementById("gogoanime").className = "buttonON";
		}
	});
}

// check if Hidive activate
function checkHidive() {
	chrome.storage.sync.get(['isHidiveOff'], function (result) {
		if (result.isHidiveOff) {
			document.getElementById("hidive").className = "buttonOFF";
		}
		else {
			document.getElementById("hidive").className = "buttonON";
		}
	});
}

// check if Youtube activate
function checkYouyube() {
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
function toggleCrunchyroll() {
	chrome.storage.sync.get(['isCrunchyrollOff'], function (result) {
		chrome.storage.sync.set({ "isCrunchyrollOff": !result.isCrunchyrollOff });
	});
	setTimeout(checkCrunchyroll);
}

// toggle Funimation
function toggleFunimation() {
	chrome.storage.sync.get(['isFunimationOff'], function (result) {
		chrome.storage.sync.set({ "isFunimationOff": !result.isFunimationOff });
	});
	setTimeout(checkFunimation);
}

// toggle Gogoanime
function toggleGogoanime() {
	chrome.storage.sync.get(['isGogoanimeOff'], function (result) {
		chrome.storage.sync.set({ "isGogoanimeOff": !result.isGogoanimeOff });
	});
	setTimeout(checkGogoanime);
}

// toggle Hidive
function toggleHidive() {
	chrome.storage.sync.get(['isHidiveOff'], function (result) {
		chrome.storage.sync.set({ "isHidiveOff": !result.isHidiveOff });
	});
	setTimeout(checkHidive);
}

// toggle Youtube
function toggleYoutube() {
	chrome.storage.sync.get(['isYoutubeOff'], function (result) {
		chrome.storage.sync.set({ "isYoutubeOff": !result.isYoutubeOff });
	});
	setTimeout(checkYouyube);
}

// reset storage
function resetdefaults() {
	chrome.storage.sync.clear();
	checkCrunchyroll();
	checkFunimation();
	checkGogoanime();
	checkHidive();
	checkYouyube();
}

// init
function init() {
	checkFunimation();
	checkCrunchyroll();
	checkGogoanime();
	checkHidive();
	checkYouyube();
	document.getElementById("crunchyroll").addEventListener("click", toggleCrunchyroll);
	document.getElementById("funimation").addEventListener("click", toggleFunimation);
	document.getElementById("gogoanime").addEventListener("click", toggleGogoanime);
	document.getElementById("hidive").addEventListener("click", toggleHidive);
	document.getElementById("youtube").addEventListener("click", toggleYoutube);
	document.getElementById("reset").addEventListener("click", resetdefaults);
}

// launch script
setTimeout(init);
