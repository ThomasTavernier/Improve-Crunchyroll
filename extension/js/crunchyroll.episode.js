// if free trial template
if (document.getElementById('showmedia_video_box')) {
  document.documentElement.setAttribute('ic_free_trial_template', true);
  document.getElementById('showmedia_video_box').id = 'showmedia_video_box_wide';
  document.getElementById('showmedia_video').after(document.getElementById('showmedia_video').cloneNode(false));
  document.getElementById('sidebar').prepend(document.getElementById('showmedia_video').cloneNode(false));
}
