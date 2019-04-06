var style = document.createElement('style');

// refresh function
refresh = function(){
	window.dispatchEvent(new Event("resize"));
}

// set style as bigger player function
setStyleAsBiggerPlayer = function(){
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
unsetStyle = function(){
	style.innerHTML = ``;
}

// cinema/normal switch function
CinemaNormalSwitch = function(){
	// if large && in video page
	if (document.getElementById("player-theater-container").children[0] != undefined && document.getElementById("player-container").offsetHeight > 0) {
		setTimeout(setStyleAsBiggerPlayer);
	}
	else {
		setTimeout(unsetStyle);
	}
	setTimeout(refresh);
}

// cinema/normal switch recursion function
CinemaNormalSwitchRecursion = function(){
	// if page is load
	if (document.getElementById("player-theater-container") != null) {
		// laucnh cinema/normal switch function
		setTimeout(CinemaNormalSwitch);
	}
	else {
		// retry in 250ms
		setTimeout(CinemaNormalSwitchRecursion, 250);
	}
}

// add event listener on cinama/normal switch recursion function
addEventListenerOnCinemaNormalSwitchRecursion = function() {
	// if cinama/normal switch exist
	if (document.getElementsByClassName("ytp-size-button ytp-button")[0] != undefined) {
		// add event listener cinama/normal switch
		document.getElementsByClassName("ytp-size-button ytp-button")[0].addEventListener("click", function(){setTimeout(CinemaNormalSwitchRecursion, 1)});
	}
	else {
		// retry in 250ms
		setTimeout(addEventListenerOnCinemaNormalSwitchRecursion, 250);
	}
}

// launcher function
launcher = function() {
	// add event listener on url change
	window.addEventListener("yt-page-data-updated", function(){setTimeout(CinemaNormalSwitchRecursion)});
	// add styleshett to document
	document.head.appendChild(style);
	// verif if the current page is a video
	setTimeout(CinemaNormalSwitchRecursion);
	// laucnh add event listener on cinama/normal switch recursion function
	setTimeout(addEventListenerOnCinemaNormalSwitchRecursion);
}

// START
chrome.storage.sync.get(['isYoutubeOff'], function(result){
	// if youtube on
	if (!result.isYoutubeOff) {
		// lauch
		launcher();
	}
});

