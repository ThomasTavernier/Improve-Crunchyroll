function init() {
  // if video page && user isn't logged in
  if (document.documentElement.getAttribute('ic_video_page') && document.getElementById('showmedia_video_box')) {
    document.documentElement.setAttribute('ic_not_logged_in', true);
    document.getElementById('showmedia_video_box').id = 'showmedia_video_box_wide';
    document.getElementById('showmedia_video').after(document.getElementById('showmedia_video').cloneNode(false));
    document.getElementById('sidebar').prepend(document.getElementById('showmedia_video').cloneNode(false));
  }
}

setTimeout(init);
