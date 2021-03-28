// if free trial template
if (document.getElementById('showmedia_video_box')) {
  document.documentElement.setAttribute('ic_free_trial_template', 'true');
  document.getElementById('showmedia_video_box').id = 'showmedia_video_box_wide';
  document.getElementById('showmedia_video').after(document.getElementById('showmedia_video').cloneNode(false));
  document.getElementById('sidebar').prepend(document.getElementById('showmedia_video').cloneNode(false));
}
const attributes = ['hide_background_image', 'hide_banner', 'hide_message_box', 'theme'];
if (window.location.pathname.match(/-\d+$/)) {
  attributes.push('header_on_hover', 'player_mode', 'scrollbar', 'theme');
}
chromeStorage.reload(...attributes);
