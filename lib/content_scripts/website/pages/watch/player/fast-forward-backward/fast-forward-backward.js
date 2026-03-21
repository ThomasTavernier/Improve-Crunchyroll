class FastForwardBackward {
  static createSvgForwardBackward(type, fastBackwardNumber) {
    return new SvgRenderer('svg')
      .setAttribute('viewBox', '0 0 226 226')
      .appendChildren(
        new SvgRenderer('use').setAttribute('href', `#${type}`),
        Render.createSvgText(Render.parseNumber(fastBackwardNumber)),
      );
  }

  static forwardBackward(player, isBackward, secondsInput) {
    const seconds = +secondsInput;
    if (seconds !== seconds) {
      return;
    }
    const time = isBackward ? player.currentTime - seconds : player.currentTime + seconds;
    const slider = document.querySelector('[data-testid="timeline-controls-container"] input[type="range"]');
    slider.value = time;
    slider.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
      }),
    );
    slider.dispatchEvent(
      new MouseEvent('mouseup', {
        bubbles: true,
      }),
    );
    [...document.getElementsByClassName('ic_forward_backward')].forEach((node) => {
      node.remove();
    });
    Render.transitionRemoveSvg(
      this.createSvgForwardBackward(isBackward ? 'backward' : 'forward', seconds)
        .addClass('ic_forward_backward')
        .setStyle(isBackward ? 'right' : 'left', '25%'),
    );
  }

  static goToTime(player, timestamp) {
    const time = timestamp - player.currentTime;
    if (time > 0) {
      this.forward(player, time);
    }
  }

  static forward(player, fastForwardNumber) {
    this.forwardBackward(player, false, fastForwardNumber);
  }

  static backward(player, fastBackwardNumber) {
    this.forwardBackward(player, true, fastBackwardNumber);
  }

  static createFastForwardBackwardButton(player, type, key, value, action) {
    return new Renderer('div')
      .addClass('ic_buttons')
      .appendChildren(this.createSvgForwardBackward(type, value))
      .setAttribute('title', `${Renderer.translate(key)} ${Render.parseNumber(value)}`)
      .addEventListener('click', (ev) => {
        ev.stopPropagation();
        action(player, value);
      });
  }

  static createFastForwardBackwardButtons(player, icDivPlayerControls) {
    icDivPlayerControls
      .removeChildren()
      .appendChildren(
        ...(chromeStorage.fast_backward_buttons.length > 0 ? chromeStorage.fast_backward_buttons.split(',') : []).map(
          (fastBackwardNumber) =>
            this.createFastForwardBackwardButton(player, 'backward', 'fastBackward', fastBackwardNumber, (...args) =>
              this.backward(...args),
            ),
        ),
        ...(chromeStorage.fast_forward_buttons.length > 0 ? chromeStorage.fast_forward_buttons.split(',') : []).map(
          (fastForwardNumber) =>
            this.createFastForwardBackwardButton(player, 'forward', 'fastForward', fastForwardNumber, (...args) =>
              this.forward(...args),
            ),
        ),
      );
  }
}
