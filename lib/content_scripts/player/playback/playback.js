function setPlaybackRate(value, animation) {
  value = Math.round((+value + Number.EPSILON) * 100) / 100;
  if (value !== value) return;
  if (value < 0.25) value = 0.25;
  if (value > 2) value = 2;
  document.getElementById('player0').playbackRate = value;
  if (!animation) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 226 226');
  svg.innerHTML = `
      <text font-size='90' font-weight='500' letter-spacing='-0.5' font-size-adjust='0.5'>
        <tspan text-anchor='middle' x='50%' y='67%'>${value}x</tspan>
      </text>`;
  svg.classList.add('playback_rate');
  renderSvg(svg);
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
