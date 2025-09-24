const icPlaybackRate = 'ic:playbackRate';

function setPlaybackRate(value = localStorage.getItem(icPlaybackRate) ?? 1, animation) {
  value = Math.round((+value + Number.EPSILON) * 100) / 100;
  if (value !== value) return;
  if (value < 0.25) value = 0.25;
  if (value > 2) value = 2;
  localStorage.setItem(icPlaybackRate, `${value}`);
  document.getElementById('player0').playbackRate = value;
  if (!animation) return;
  transitionRemoveSvg(
    new SvgRenderer('svg')
      .addClass('playback_rate')
      .setAttribute('viewBox', '0 0 226 226')
      .appendChildren(createSvgText(value)),
  );
}

function setQualitySettings(enabled) {
  const configDelta = window.localStorage.getItem('Vilos:ConfigDelta');
  if (!configDelta) return;

  const config = JSON.parse(configDelta);
  config['qualitySettings'] = Object.assign(config['qualitySettings'] || {}, { enabled });

  window.localStorage.setItem('Vilos:ConfigDelta', JSON.stringify(config));
}

function playbackHandler(player) {
  player.addEventListener('play', () => {
    document.documentElement.setAttribute('ic_playing', 'true');
  });
  player.addEventListener('pause', () => {
    document.documentElement.setAttribute('ic_playing', 'false');
  });
  player.addEventListener('canplay', () => {
    setPlaybackRate();
  });
}
