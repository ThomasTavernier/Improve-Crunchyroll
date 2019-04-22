var style = document.createElement('style');
var ratio = window.screen.availHeight / window.screen.availWidth;

// refresh function
refresh = function(){
	window.dispatchEvent(new Event("resize"));
}

// set style as bigger player function
setStyleAsBiggerPlayer = function(){
	style.innerHTML = `
    #wrapper {
		padding: 0 !important;
		width: 100% !important;
		background-color: #000 !important;
	}
	#wrapper_inside {
		width: 100% !important;
	}
	.content_left {
		width: 100% !important;
	}
	.anime_video_body {
		padding: 0 !important;
	}
	.main_body {
		border: 0 !important;
	}
	.play-video.selected {
		max-height: 100vh !important;
		height: calc((` + ratio + `) * 100vw);;
		padding: 0 !important;
	}
	.content, .anime_video_body_watch_items, .anime_video_body_watch {
		margin: 0 !important;
	}
	
	.banner, .anime_name.anime_video, h1, .anime_video_body_cate, .menu_top_link, .content_right, .headnav, .anime_video_body:nth-of-type(2) div:nth-of-type(2), .download-anime, .anime_video_body div:nth-of-type(7) {
		display: none !important;
	}
	.anime_video_body_episodes, .anime_video_body_comment, .anime_muti_link, .main_body:nth-of-type(3), footer {
		float: none !important;
	    width: 1088px !important;
		margin: auto !important;
		background-color: #1b1b1b !important;
	}
	.anime_muti_link ul {
		border-top: 1px solid #a1a1a1 !important;
		border-right: 1px solid #a1a1a1 !important;
		border-left: 1px solid #a1a1a1!important;
		padding: 20px !important;
		background-color: #1b1b1b !important;
	}
	.anime_video_body_comment {
		border-bottom: 1px solid #a1a1a1 !important;
		border-right: 1px solid #a1a1a1 !important;
		border-left: 1px solid #a1a1a1!important;
		padding: 0 20px !important;
	}
	.main_body:nth-of-type(3) {
		border: 1px solid #a1a1a1 !important;
	}
	.anime_video_body:nth-of-type(3) {
		padding: 20px !important;
	}
	footer {
		border-bottom: 1px solid #a1a1a1 !important;
		border-right: 1px solid #a1a1a1 !important;
		border-left: 1px solid #a1a1a1!important;
		height: 98px !important;
	}
`
}

// unset style function
unsetStyle = function(){
	style.innerHTML = ``;
}

// toggle function
toggle = function(){
	// if in video page
	if (document.getElementById("load_anime") != null) {
		// set style
		setTimeout(setStyleAsBiggerPlayer);
	}
	else {
		// unset style
		setTimeout(unsetStyle);
	}
	// refresh
	setTimeout(refresh);
}

// toggle recursion function
toggleRecursion = function(){
	// if page is load
	if (document.getElementById("wrapper") != null) {
		// laucnh cinema/normal switch function
		setTimeout(toggle);
	}
	else {
		// retry in 250ms
		setTimeout(toggleRecursion, 250);
	}
}

// launcher function
launcher = function() {
	// add styleshett to document
	document.head.appendChild(style);
	// verif if the current page is a video
	setTimeout(toggleRecursion);
}

// START
chrome.storage.sync.get(['isGogoanimeOff'], function(result){
	// if gogoanime on
	if (!result.isGogoanimeOff) {
		// lauch
		launcher();
	}
});

