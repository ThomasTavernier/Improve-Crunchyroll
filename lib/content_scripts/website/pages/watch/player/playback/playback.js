class Playback {
  static BIT_MOVIN_PLAYBACK_RATE_KEY = 'playbackRate';

  static setPlaybackRate(player, value, animation) {
    value = Math.round((+value + Number.EPSILON) * 100) / 100;
    if (value !== value) return;
    if (value < 0.25) value = 0.25;
    if (value > 4) value = 4;

    localStorage.setItem(Playback.BIT_MOVIN_PLAYBACK_RATE_KEY, `${value}`);
    player.playbackRate = value;
    const playbackSpeedButton = document.querySelector('[data-testid="playback-speed-button"]');
    if (playbackSpeedButton) {
      playbackSpeedButton.innerText = `${value}x`;
    }
    if (!animation) return;
    Render.transitionRemoveSvg(
      new SvgRenderer('svg')
        .addClass('playback_rate')
        .setAttribute('viewBox', '0 0 226 226')
        .appendChildren(Render.createSvgText(value)),
    );
  }
}
