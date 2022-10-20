function createSvgForwardBackward(type, fastBackwardNumber) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 226 226');
  svg.innerHTML = `
      <use xlink:href='#${type}'></use>
      <text font-size='90' font-weight='500' letter-spacing='-0.5' font-size-adjust='0.5'>
        <tspan text-anchor='middle' x='50%' y='67%'>${parseNumber(fastBackwardNumber)}</tspan>
      </text>`;
  return svg;
}

function forwardBackward(isBackward, seconds) {
  if (isBackward) {
    document.getElementById('player0').currentTime -= ~~seconds;
  } else {
    document.getElementById('player0').currentTime += ~~seconds;
  }
  [...document.getElementsByClassName('ic_forward_backward')].forEach((node) => {
    node.remove();
  });
  const svg = createSvgForwardBackward(isBackward ? 'backward' : 'forward', seconds);
  svg.classList.add('ic_forward_backward');
  svg.style[isBackward ? 'right' : 'left'] = '25%';
  renderSvg(svg);
}

function forward(fastForwardNumber) {
  forwardBackward(false, fastForwardNumber);
}

function backward(fastBackwardNumber) {
  forwardBackward(true, fastBackwardNumber);
}

function createFastForwardBackwardButtons(icDivPlayerControls) {
  icDivPlayerControls.innerHTML = '';
  let buttonList = [];
  (chromeStorage.fast_backward_buttons.length > 0 ? chromeStorage.fast_backward_buttons.split(',') : []).forEach(
    (fastBackwardNumber) => {
      const fastBackwardButton = document.createElement('div');
      fastBackwardButton.appendChild(createSvgForwardBackward('backward', fastBackwardNumber));
      fastBackwardButton.title = `${translate('fastBackward')} ${parseNumber(fastBackwardNumber)}`;
      fastBackwardButton.addEventListener('click', (ev) => {
        ev.stopPropagation();
        backward(fastBackwardNumber);
      });
      buttonList.push(fastBackwardButton);
    },
  );
  (chromeStorage.fast_forward_buttons.length > 0 ? chromeStorage.fast_forward_buttons.split(',') : []).forEach(
    (fastForwardNumber) => {
      const fastForwardButton = document.createElement('div');
      fastForwardButton.appendChild(createSvgForwardBackward('forward', fastForwardNumber));
      fastForwardButton.title = `${translate('fastForward')} ${parseNumber(fastForwardNumber)}`;
      fastForwardButton.addEventListener('click', (ev) => {
        ev.stopPropagation();
        forward(fastForwardNumber);
      });
      buttonList.push(fastForwardButton);
    },
  );
  buttonList.forEach((button) => {
    button.classList.add('ic_buttons');
    icDivPlayerControls.appendChild(button);
  });
}
