function init() {
	if (document.getElementById('showmedia_video')) {
		let style = document.createElement('style');
		style.innerHTML = `
    		html[cbp_video_page=true][cbp_scrollbar=true] #showmedia_video {
				height: calc((${window.screen.height / window.screen.width}) * 100vw);
    		}
    		html[cbp_video_page=true][cbp_scrollbar=false] #showmedia_video {
				height: calc((${window.screen.height / window.screen.width}) * (100vw - ${window.innerWidth - document.body.offsetWidth}px));
    		}`;
		document.head.appendChild(style);
		document.documentElement.setAttribute('cbp_video_page', true);

		// if user isn't log in
		if (document.getElementById('showmedia_video_box') !== null) {
			document.documentElement.setAttribute('cbp_not_logged', true);
			document.querySelector('.showmedia-trail.cf').appendChild(document.getElementById('showmedia_video'));
			document.getElementById('showmedia_video_box').id = 'showmedia_video_box_wide';
		}
	}
}

setTimeout(init);