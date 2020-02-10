function init() {
	// if video page && user isn't logged in
	if (document.documentElement.getAttribute('cbp_video_page') && document.getElementById('showmedia_video_box')) {
		document.documentElement.setAttribute('cbp_not_logged', true);
		document.querySelector('.showmedia-trail.cf').appendChild(document.getElementById('showmedia_video'));
		document.getElementById('showmedia_video_box').id = 'showmedia_video_box_wide';
	}
}

setTimeout(init);