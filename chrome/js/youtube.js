// DO
DO = function(){
	// remove page margin
	document.getElementById("page-manager").style.marginTop = "0";
	// set video container maximum height
	document.getElementById("player-theater-container").style.maxHeight = "100vh";
	// hide header
	document.getElementById("masthead-container").style.display = "none";
	}

// UNDO
UNDO = function(){
	// set page margin
	document.getElementById("page-manager").style.marginTop = "56px";
	// remove video container maximum height
	document.getElementById("player-theater-container").style.maxHeight = "";
	// display header
	document.getElementById("masthead-container").style.display = "block";
	} 

// toggle video player
toggle = function(){
	// if large && in video page
	if (document.getElementById("player-theater-container").children[0] != undefined && document.getElementById("player-container").offsetHeight > 0 ) {
		DO();
		}
	else {
		UNDO();
		}
	window.dispatchEvent(new Event("resize"));
	}

// delayed launcher
delayedLauncher = function() {
	// if button video player size exist
	if (document.getElementsByClassName("ytp-size-button ytp-button")[0] != undefined && DOIT) {
		DOIT=false;
		// add event listener on video player size exist
		document.getElementsByClassName("ytp-size-button ytp-button")[0].addEventListener("click", function(){setTimeout(toggle)});
		
		}
	}

// launcher
launcher = function() {
	toggle;
	// add event listener on url change
	window.addEventListener("yt-page-data-updated", function(){setTimeout(toggle, 500)});
	DOIT=true;
	for (i=0; i < 10; i++) {
		setTimeout(delayedLauncher, i * 250);
		}
	}

// START
chrome.storage.sync.get(['isYoutubeOff'], function(result){
	// if youtube on
	if (!result.isYoutubeOff) {
		// lauch
		launcher();
		}
	});
