function createSvgForwardBackward(type, fastBackwardNumber) {
  return new SvgRenderer('svg')
    .setAttribute('viewBox', '0 0 226 226')
    .appendChildren(
      new SvgRenderer('use').setAttribute('href', `#${type}`),
      createSvgText(parseNumber(fastBackwardNumber)),
    );
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
  transitionRemoveSvg(
    createSvgForwardBackward(isBackward ? 'backward' : 'forward', seconds)
      .addClass('ic_forward_backward')
      .setStyle(isBackward ? 'right' : 'left', '25%'),
  );
}

function forward(fastForwardNumber) {
  forwardBackward(false, fastForwardNumber);
}

function backward(fastBackwardNumber) {
  forwardBackward(true, fastBackwardNumber);
}

function createFastForwardBackwardButton(type, key, value, action) {
  return new Renderer('div')
    .addClass('ic_buttons')
    .appendChildren(createSvgForwardBackward(type, value))
    .setAttribute('title', `${Renderer.translate(key)} ${parseNumber(value)}`)
    .addEventListener('click', (ev) => {
      ev.stopPropagation();
      action(value);
    });
}

function createFastForwardBackwardButtons(icDivPlayerControls) {
  icDivPlayerControls.removeChildren().appendChildren(
    ...(chromeStorage.fast_backward_buttons.length > 0 ? chromeStorage.fast_backward_buttons.split(',') : []).map(
      (fastBackwardNumber) => createFastForwardBackwardButton('backward', 'fastBackward', fastBackwardNumber, backward),
    ),
    ...(chromeStorage.fast_forward_buttons.length > 0 ? chromeStorage.fast_forward_buttons.split(',') : []).map(
      (fastForwardNumber) => createFastForwardBackwardButton('forward', 'fastForward', fastForwardNumber, forward),
    ),
  );
}
