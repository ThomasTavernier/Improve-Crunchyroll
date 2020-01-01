// This code is to be injected in "https://www.crunchyroll.com/*"

function setAttributes() {
	ATTRIBUTES.forEach(attribute => document.documentElement.setAttribute('cbp_' + attribute, chromeStorage[attribute]));
}

function init() {
	// if we are on a video page
	if (document.getElementById("showmedia_video_player") !== null) {
		// if user isn't log in
		if (document.getElementById("showmedia_video_box") !== null) {
			document.documentElement.setAttribute('cbp_not_logged', true);
			document.querySelector('.showmedia-trail.cf').appendChild(document.getElementById("showmedia_video"));
			document.getElementById("showmedia_video_box").id = "showmedia_video_box_wide";
		}
		let style = document.createElement('style');
		style.innerHTML = `
			html[cbp_scrollbar=true] #showmedia_video {
				height: calc((${window.screen.height / window.screen.width}) * 100vw);
			}
			html[cbp_scrollbar=false] #showmedia_video {
				height: calc((${window.screen.height / window.screen.width}) * (100vw - ${scrollBarWidth}px));
			}
		`
		document.head.appendChild(style);
		document.documentElement.setAttribute('cbp_video_page', true);
	}
}

const scrollBarWidth = window.innerWidth - document.body.offsetWidth;

setTimeout(init);

chromeStorageInit = function () {
	setAttributes();
};