// This code is to be inserted in "https://www.crunchyroll.com/*"
// If we are on a video page, it will make the video player bigger

// set style as bigger player
function setStyleAsBiggerPlayer() {
	// if we are on a video page
	if (document.getElementById("showmedia_video_player") !== null) {
		// if user isn't log in
		if (document.getElementById("showmedia_video_box") !== null) {
			document.getElementsByClassName("showmedia-trail cf")[0].appendChild(document.getElementById("showmedia_video"));
			document.getElementById("showmedia_video_box").id = "showmedia_video_box_wide";
		}
		// create a style sheet
		var style = document.createElement('style');
		// write style sheet
		style.innerHTML = `
		#showmedia_video {
			height: calc((` + window.screen.availHeight / window.screen.availWidth + `) * 100vw);;
		}
		#template_container {
			padding: 0 !important;
			width: 100% !important;
		}	
		#header_beta {
    		opacity: 0;
    		position: absolute;
		}
		`
		// insert style sheet
		document.head.appendChild(style);
	}
}

// set focus without crunchyrollHTML5 function
function setFocus() {
	// if we are on a video page
	if (document.getElementById("showmedia_video_player") !== null) {
		//set focus to the video
		document.getElementById("showmedia_video_player").firstChild.focus();
	}
}

// init
function init() {
	// set big player
	setTimeout(setStyleAsBiggerPlayer);
	// set focus to the video player
	setTimeout(setFocus, 250);
}

init();