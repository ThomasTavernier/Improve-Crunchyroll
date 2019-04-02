// remove Ads
removeAds = function(){
	// remove expo banner
	document.getElementsByClassName("cr-expo-banner")[0].remove();
	// remove message box	
	document.getElementById("message_box").innerHTML = "";
	}

// fix Iframe
fixIframe = function(){
	if (document.getElementById("vilos-player") != null && doFixIframe) {
		// set iframe height
		document.getElementById("vilos-player").style.height = "100%";
		// set iframe width
		document.getElementById("vilos-player").style.width = "101%";
		// set iframe align
		document.getElementById("vilos-player").align = "right";
		// do not enter this if again
		doFixIframe = false;
		}
	}


// DO
DO = function(){
	//set width of showmedia
	document.getElementById("showmedia").style.width = "960px";
	//set margin of showmedia
	document.getElementById("showmedia").style.margin = "0 auto";
	//set width of footer
	document.getElementById("footer").style.width = "960px";
	//set margin of footer
	document.getElementById("footer").style.margin = "0 auto";
	// set video container background color
	document.getElementById("showmedia_video").style.backgroundColor = "black";
	// set video container width
	document.getElementById("showmedia_video").style.width = "100%";
	// set video container height
	document.getElementById("showmedia_video").style.height = window.screen.availHeight / window.screen.availWidth * 100 + "vw";
	// set video container minimum width
	document.getElementById("showmedia_video").style.minWidth = "960px";
	// set video container minimum height
	document.getElementById("showmedia_video").style.minHeight = "540px";
	// set video container maximum height
	document.getElementById("showmedia_video").style.maxHeight = "100vh";
	// remove padding left of player
	//document.getElementById("showmedia_video_box_wide").style.paddingLeft = "";
	// set player width
	document.getElementById("showmedia_video_box_wide").style.width = "100%";
	// set player height
	document.getElementById("showmedia_video_box_wide").style.height = "100%";
	// remove padding top of webpage
	document.getElementById("template_scroller").style.paddingTop = "0px";
	// remove padding bottom, left and right of webpage
	document.getElementById("template_container").style.padding = "0px";
	// set size of webpage
	document.getElementById("template_container").style.width = "100%";
	// hide header
	document.getElementById("header_beta").style.display = "none";
	// hide title
	document.getElementsByClassName("showmedia-header cf")[0].style.display = "none";
	
	// if Crunchyroll HTML5 extension installed
	if (document.getElementById("showmedia_video_box_wide").firstChild.style != undefined) {
		// set video width for Crunchyroll HTML5 extension
		document.getElementById("showmedia_video_box_wide").firstChild.style.width = "100%";
		// set video height for Crunchyroll HTML5 extension
		document.getElementById("showmedia_video_box_wide").firstChild.style.height = "100%";
		// resize window
		window.dispatchEvent(new Event("resize"));
		}
	}

// UNDO
UNDO = function(){ 
	// set video container height
	document.getElementById("showmedia_video").style.height = "364px";
	// set video container minimum width
	document.getElementById("showmedia_video").style.minWidth = "";
	// set video container minimum height
	document.getElementById("showmedia_video").style.minHeight = "";
	// set padding top of webpage
	document.getElementById("template_scroller").style.paddingTop = "";
	// set padding bottom, left and right of webpage
	document.getElementById("template_container").style.padding = "";
	// set size of webpage
	document.getElementById("template_container").style.width = "";
	// display header
	document.getElementById("header_beta").style.display = "block";
	// display title
	document.getElementsByClassName("showmedia-header cf")[0].style.display = "block";
	if (document.getElementById("showmedia_video_box") != null) {
		// resize window
		window.dispatchEvent(new Event("resize"));
		}
	} 

// toggle video player
toggle = function(){
	// if large
	if (document.getElementById("main_content").className == "left") {
		DO();
		}
	else {
		UNDO();
		}
	}

// launcher
launcher = function(){
// if there is ads
if (document.getElementsByClassName("cr-expo-banner")[0] != undefined) {
	removeAds();
	}
// if in a video page
if (document.getElementById("main_content").className == "left") {
	DO();
	}
// if Crunchyroll HTML5 extension installed
if (document.getElementsByClassName("chrome-button chrome-size-button")[0] != undefined) {
	document.getElementsByClassName("chrome-button chrome-size-button")[0].addEventListener("click", toggle);
	}	
// fix Iframe
doFixIframe = true;
for (i=0; i < 10; i++) {
	setTimeout(fixIframe, i * 1000);
	}
}

// START
chrome.storage.sync.get(['isCrunchyrollOff'], function(result){
	// if crunchyroll on
	if (!result.isCrunchyrollOff) {
		// lauch
		launcher();
		}
	});
	