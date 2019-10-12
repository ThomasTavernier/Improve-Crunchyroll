// This code is to be inserted in "https://www.crunchyroll.com/*"
// If we are on a video page, it will make the video player bigger

function setStyleAsBiggerPlayer() {
	// if we are on a video page
	if (document.getElementById("showmedia_video_player") !== null) {
		// if user isn't log in
		if (document.getElementById("showmedia_video_box") !== null) {
			document.getElementsByClassName("showmedia-trail cf")[0].appendChild(document.getElementById("showmedia_video"));
			document.getElementById("showmedia_video_box").id = "showmedia_video_box_wide";
		}
		let style = document.createElement('style');
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
		document.head.appendChild(style);
	}
}

function init() {
	setStyleAsBiggerPlayer();
}

init();
