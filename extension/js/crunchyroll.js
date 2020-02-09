function init() {
	if (document.getElementById('showmedia_video')) {
		document.documentElement.setAttribute('cbp_video_page', true);

		// if user isn't logged in
		if (document.getElementById('showmedia_video_box') !== null) {
			document.documentElement.setAttribute('cbp_not_logged', true);
			document.querySelector('.showmedia-trail.cf').appendChild(document.getElementById('showmedia_video'));
			document.getElementById('showmedia_video_box').id = 'showmedia_video_box_wide';
		}
	}
}

setTimeout(init);