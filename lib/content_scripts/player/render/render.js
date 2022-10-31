function parseNumber(number) {
  return [2, 1, 0]
    .map((v) => ~~((number % Math.pow(60, v + 1)) / Math.pow(60, v)))
    .reduce((acc, value) => (acc ? `${acc}:${value < 10 ? '0' : ''}${value}` : `${value || ''}`), '');
}

function transitionRemoveSvg(svg) {
  svg.addEventListener('transitionend', () => {
    svg.remove();
  });
  document.getElementById('velocity-controls-package').appendChild(svg.getElement()).focus({ preventScroll: true });
  svg.addClass('ic_remove');
}

function createSvgText(textContent) {
  return new SvgRenderer('text')
    .setStyle('font-size', 90)
    .setAttribute('font-weight', 500)
    .setAttribute('letter-spacing', -0.5)
    .setAttribute('font-size-adjust', 0.5)
    .appendChildren(
      new SvgRenderer('tspan')
        .setAttribute('text-anchor', 'middle')
        .setAttribute('x', '50%')
        .setAttribute('y', '67%')
        .setText(textContent),
    );
}

function createAndInsertSvgDefs() {
  document.body.appendChild(
    new SvgRenderer('svg')
      .setStyle('display', 'none')
      .appendChildren(
        new SvgRenderer('symbol')
          .setAttribute('id', 'backward')
          .appendChildren(
            new SvgRenderer('path').setAttribute(
              'd',
              'M81.36,0.7857l-48.26336,30.8543l5.95016,3.80492l42.3132,27.04938v-21.10805l36.16,20.64016v-25.63687c45.36494,2.35865 81.36,39.69086 81.36,85.65047c0,47.48528 -38.39472,85.88 -85.88,85.88c-47.48528,0 -85.88,-38.39472 -85.88,-85.88c0.02305,-1.63007 -0.83338,-3.14629 -2.24135,-3.96805c-1.40797,-0.82176 -3.14934,-0.82176 -4.55731,0c-1.40797,0.82176 -2.2644,2.33798 -2.24135,3.96805c0,52.37056 42.54944,94.92 94.92,94.92c52.37056,0 94.92,-42.54944 94.92,-94.92c0,-50.85532 -40.12316,-92.4409 -90.4,-94.80523v-25.98117l-36.16,20.64016zM108.48,16.82641v14.05438c-0.08068,0.48812 -0.08068,0.98618 0,1.4743v14.09852l-25.95469,-14.81359zM72.32,17.2943v28.69141l-22.44992,-14.3457z',
            ),
          ),
        new SvgRenderer('symbol')
          .setAttribute('id', 'forward')
          .appendChildren(
            new SvgRenderer('path').setAttribute(
              'd',
              'M144.64,0.7857v21.10805l-36.16,-20.64016v25.98117c-50.27684,2.36433 -90.4,43.94992 -90.4,94.80523c0,52.37056 42.54944,94.92 94.92,94.92c52.37056,0 94.92,-42.54944 94.92,-94.92c0.02305,-1.63007 -0.83338,-3.14629 -2.24135,-3.96805c-1.40797,-0.82176 -3.14934,-0.82176 -4.55731,0c-1.40797,0.82176 -2.2644,2.33798 -2.24135,3.96805c0,47.48528 -38.39472,85.88 -85.88,85.88c-47.48528,0 -85.88,-38.39472 -85.88,-85.88c0,-45.9596 35.99506,-83.29182 81.36,-85.65047v25.63687l36.16,-20.64016v21.10805l6.95656,-4.44937l41.3068,-26.40492zM117.52,16.82641l25.95469,14.81359l-25.95469,14.81359v-14.05438c0.08068,-0.48812 0.08068,-0.98618 0,-1.4743zM153.68,17.2943l22.44992,14.3457l-22.44992,14.3457z',
            ),
          ),
      )
      .getElement(),
  );
}

function createIcDiv() {
  return new Renderer('div')
    .addClass('ic_div')
    .addEventListener('mouseup', (evt) => evt.stopPropagation())
    .addEventListener('mousedown', (evt) => evt.stopPropagation());
}

function insertCbpDivs(vilosControlsContainer, icDivPlayerControls, icDivPlayerMode) {
  if (vilosControlsContainer.contains(icDivPlayerControls)) return;
  const { firstElementChild, lastElementChild } =
    vilosControlsContainer.querySelector('#settingsControl')?.parentElement?.parentElement || {};
  firstElementChild?.appendChild(icDivPlayerControls);
  lastElementChild?.insertBefore(icDivPlayerMode, lastElementChild.children[1]);
}
