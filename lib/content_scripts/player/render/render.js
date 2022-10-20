function render({ tagName, children, callback, ...properties }) {
  const element = document.createElement(tagName);
  Object.entries(properties).forEach(([property, value]) => (element[property] = value));
  if (Array.isArray(children))
    children.forEach((child) => element.appendChild(child instanceof HTMLElement ? child : render(child)));
  if (typeof callback === 'function') callback(element);
  return element;
}

function parseNumber(number) {
  return [2, 1, 0]
    .map((v) => ~~((number % Math.pow(60, v + 1)) / Math.pow(60, v)))
    .reduce((acc, value) => (acc ? `${acc}:${value < 10 ? '0' : ''}${value}` : `${value || ''}`), '');
}

function translate(key) {
  const label = chrome.i18n.getMessage(key);
  return label !== '' ? label : key;
}

function renderSvg(svg) {
  svg.addEventListener('transitionend', () => {
    svg.remove();
  });
  document.getElementById('velocity-controls-package').appendChild(svg).focus({ preventScroll: true });
  svg.classList.add('ic_remove');
}

function createAndInsertSvgDefs() {
  Promise.all(
    ['forward', 'backward'].map((file) =>
      fetch(chrome.runtime.getURL(`/lib/content_scripts/player/resources/${file}.html`)),
    ),
  )
    .then((responses) => Promise.all(responses.map((response) => response.text())))
    .then((symbols) => {
      const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgDefs.style.display = 'none';
      svgDefs.innerHTML = `<defs>${symbols.join('')}</defs>`;
      document.body.appendChild(svgDefs);
    });
}

function createDivs(n) {
  return [...Array(n)].map(() => {
    const div = document.createElement('div');
    div.className = 'ic_div';
    ['mouseup', 'mousedown'].forEach((type) => {
      div.addEventListener(type, (evt) => evt.stopPropagation());
    });
    return div;
  });
}

function insertCbpDivs(vilosControlsContainer, icDivPlayerControls, icDivPlayerMode) {
  if (vilosControlsContainer.contains(icDivPlayerControls)) return;
  const { firstElementChild, lastElementChild } =
    vilosControlsContainer.querySelector('#settingsControl')?.parentElement?.parentElement || {};
  firstElementChild?.appendChild(icDivPlayerControls);
  lastElementChild?.insertBefore(icDivPlayerMode, lastElementChild.children[1]);
}
