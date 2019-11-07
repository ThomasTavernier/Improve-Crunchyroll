// This code is to be injected in "https://www.crunchyroll.com/*"

function setAttributes() {
	for (let attribute of ATTRIBUTES) {
		document.documentElement.setAttribute('cbp_' + attribute, chromeStorage[attribute]);
	}
}

function init() {
	// if we are on a video page
	if (document.getElementById("showmedia_video_player") !== null) {
		// if user isn't log in
		if (document.getElementById("showmedia_video_box") !== null) {
			document.documentElement.setAttribute('cbp_not_logged', true);
			document.getElementsByClassName("showmedia-trail cf")[0].appendChild(document.getElementById("showmedia_video"));
			document.getElementById("showmedia_video_box").id = "showmedia_video_box_wide";
		}
		let style = document.createElement('style');
		style.innerHTML = `
			#showmedia_video {
				height: calc((` + window.screen.availHeight / window.screen.availWidth + `) * 100vw);
			}
		`
		document.head.appendChild(style);
		document.documentElement.setAttribute('cbp_video_page', true);
	}
};

setTimeout(init);

chromeStorageInit = function () {
	setAttributes();
};