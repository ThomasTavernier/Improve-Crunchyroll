// check if Crunchyroll activate
checkCrunchyroll = function(){
chrome.storage.sync.get(['isCrunchyrollOff'], function(result){
	if (result.isCrunchyrollOff) {
		document.getElementById("crunchyroll").className  = "buttonOFF";
	}
	else {
		document.getElementById("crunchyroll").className  = "buttonON";
	}
});
}

// check if Youtube activate
checkYouyube = function(){
chrome.storage.sync.get(['isYoutubeOff'], function(result){
	if (result.isYoutubeOff) {
		document.getElementById("youtube").className  = "buttonOFF";
	}
	else {
		document.getElementById("youtube").className  = "buttonON";
	}
});
}

// toggle Crunchyroll
toggleCrunchyroll = function(){
	chrome.storage.sync.get(['isCrunchyrollOff'], function(result){
		chrome.storage.sync.set({"isCrunchyrollOff": !result.isCrunchyrollOff});
	});
	setTimeout(checkCrunchyroll);
}

// toggle Youtube
toggleYoutube = function(){
	chrome.storage.sync.get(['isYoutubeOff'], function(result){
		chrome.storage.sync.set({"isYoutubeOff": !result.isYoutubeOff});
	});
	setTimeout(checkYouyube);
}

// reset storage
resetdefaults = function(){
	chrome.storage.sync.clear();
	checkCrunchyroll();
	checkYouyube();
}

// launcher
launcher = function(){
	checkCrunchyroll();
	checkYouyube();
	document.getElementById("crunchyroll").addEventListener("click", toggleCrunchyroll);
	document.getElementById("youtube").addEventListener("click", toggleYoutube);
	document.getElementById("reset").addEventListener("click", resetdefaults);
}

// launch script
setTimeout(launcher);

