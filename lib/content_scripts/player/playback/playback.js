function setPlaybackRate(value, animation) {
  value = Math.round((+value + Number.EPSILON) * 100) / 100;
  if (value !== value) return;
  if (value < 0.25) value = 0.25;
  if (value > 2) value = 2;
  document.getElementById('player0').playbackRate = value;
  if (!animation) return;
  transitionRemoveSvg(
    new SvgRenderer('svg')
      .addClass('playback_rate')
      .setAttribute('viewBox', '0 0 226 226')
      .appendChildren(createSvgText(value)),
  );
}

function playbackHandler() {
  const player = document.getElementById('player0');
  player.addEventListener('play', () => {
    document.documentElement.setAttribute('ic_playing', 'true');
  });
  player.addEventListener('pause', () => {
    document.documentElement.setAttribute('ic_playing', 'false');
  });
}
