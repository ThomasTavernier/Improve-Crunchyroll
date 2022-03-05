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

function createFastForwardBackwardButtons() {
  icDivPlayerControls.innerHTML = '';
  let buttonList = [];
  (chromeStorage.fast_backward_buttons.length > 0 ? chromeStorage.fast_backward_buttons.split(',') : []).forEach(
    (fastBackwardNumber) => {
      const fastBackwardButton = document.createElement('div');
      fastBackwardButton.appendChild(createSvgForwardBackward('backward', fastBackwardNumber));
      fastBackwardButton.title = `${chrome.i18n.getMessage('fastBackward')} ${parseNumber(fastBackwardNumber)}`;
      fastBackwardButton.addEventListener('click', () => backward(fastBackwardNumber));
      buttonList.push(fastBackwardButton);
    },
  );
  (chromeStorage.fast_forward_buttons.length > 0 ? chromeStorage.fast_forward_buttons.split(',') : []).forEach(
    (fastForwardNumber) => {
      const fastForwardButton = document.createElement('div');
      fastForwardButton.appendChild(createSvgForwardBackward('forward', fastForwardNumber));
      fastForwardButton.title = `${chrome.i18n.getMessage('fastForward')} ${parseNumber(fastForwardNumber)}`;
      fastForwardButton.addEventListener('click', () => forward(fastForwardNumber));
      buttonList.push(fastForwardButton);
    },
  );
  buttonList.forEach((button) => {
    button.classList.add('ic_buttons');
    icDivPlayerControls.appendChild(button);
  });
}

function playingHandler() {
  const player = document.getElementById('player0');
  player.addEventListener('play', () => {
    document.documentElement.setAttribute('ic_playing', 'true');
  });
  player.addEventListener('pause', () => {
    document.documentElement.setAttribute('ic_playing', 'false');
  });
}

function createAndInsertSvgDefs() {
  Promise.all(['forward', 'backward'].map((file) => fetch(chrome.runtime.getURL(`/resources/${file}.html`))))
    .then((responses) => Promise.all(responses.map((response) => response.text())))
    .then((symbols) => {
      const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgDefs.style.display = 'none';
      svgDefs.innerHTML = `<defs>${symbols.join('')}</defs>`;
      document.body.appendChild(svgDefs);
    });
}

function createDivs() {
  [icDivPlayerControls, icDivPlayerMode].forEach((div) => {
    div.className = 'ic_div';
    ['mouseup', 'mousedown'].forEach((type) => {
      div.addEventListener(type, (evt) => evt.stopPropagation());
    });
  });

  createPlayerButton();
  chromeStorage.LOADED.then(createFastForwardBackwardButtons);
}

function scrollBarChange() {
  chrome.storage.local.set({
    scrollbar: !chromeStorage.scrollbar,
  });
}

function playerMode1Change() {
  chrome.storage.local.set({
    theater_mode: !chromeStorage.theater_mode,
    player_mode:
      chromeStorage.player_mode === 0 || chromeStorage.player_mode === 1
        ? !chromeStorage.theater_mode
          ? 1
          : 0
        : chromeStorage.player_mode,
  });
}

function playerMode2Change() {
  chrome.storage.local.set({
    player_mode: (chromeStorage.player_mode === 2 ? 0 : 2) === 2 ? 2 : chromeStorage.theater_mode ? 1 : 0,
  });
}

function createPlayerButton() {
  [
    {
      className: 'scrollbar',
      chromeStorageKey: 'scrollbar',
      title: 'scrollbar',
      onChange: scrollBarChange,
    },
    {
      className: 'theater_mode',
      chromeStorageKey: 'theater_mode',
      title: 'theaterMode',
      onChange: playerMode1Change,
    },
    {
      className: 'fullscreen_mode',
      chromeStorageKey: 'player_mode',
      eq: 2,
      title: 'fullscreenMode',
      onChange: playerMode2Change,
    },
  ].forEach((button) => {
    let span = document.createElement('span');
    span.className = `ic_buttons ${button.className}`;
    span.title = chrome.i18n.getMessage(button.title);
    span.addEventListener('click', button.onChange);
    icDivPlayerMode.appendChild(span);
  });
}

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

function createAndInsertSettings() {
  const velocitySettingsMenu = document.getElementById('velocity-settings-menu');
  const firstElementChild = velocitySettingsMenu.firstElementChild;
  [
    {
      title: translate('playbackRate'),
      type: 'playbackRate',
      values: [
        {
          type: 'slider',
          value: '1',
          min: 0.25,
          max: 2,
          step: 0.05,
        },
        {
          value: 0.25,
        },
        {
          value: 0.5,
        },
        {
          value: 0.75,
        },
        {
          value: 1,
          name: 'normal',
        },
        {
          value: 1.25,
        },
        {
          value: 1.5,
        },
        {
          value: 1.75,
        },
        {
          value: 2,
        },
      ],
      callback: setPlaybackRate,
    },
  ].forEach(({ type, title, values, callback }) => {
    callback(parseFloat(localStorage.getItem(`Vilos:${type}`), false));
    const displayValue = render({
      tagName: 'span',
      className: 'font',
    });
    velocitySettingsMenu.insertBefore(
      render({
        tagName: 'div',
        id: `ic_${type}_menu`,
        classList: ['ic_menu'],
        children: [
          {
            tagName: 'div',
            className: 'font',
            innerHTML: title,
          },
          {
            tagName: 'div',
            className: 'right',
            children: [
              {
                tagName: 'div',
                className: 'right_text',
                children: [displayValue],
              },
              {
                tagName: 'div',
                className: 'next',
              },
            ],
          },
        ],
        callback: (element) => {
          element.addEventListener('click', () => {
            window.location.hash = '';
            document.getElementById('velocity-settings-menu').setAttribute('ic_options', 'hide');
            window.location.hash = type;
          });
        },
      }),
      firstElementChild,
    );
    const elementByValues = {};
    velocitySettingsMenu.insertBefore(
      render({
        tagName: 'div',
        id: type,
        className: 'ic_settings',
        children: [
          {
            tagName: 'div',
            className: 'ic_back',
            innerHTML: `<div class='back'></div><div class='font'>${title}</div>`,
            callback: (element) => {
              element.addEventListener('click', () =>
                document.getElementById('velocity-settings-menu').removeAttribute('ic_options'),
              );
            },
          },
          {
            tagName: 'div',
            className: 'ic_options',
            children: values.map((option) => {
              const element = render({
                tagName: 'div',
                className: 'ic_option',
                innerHTML: `
                <svg viewBox='0 0 20 20' style='height: 20px; width: 20px;'>
                  <circle class='bg' cx='10' cy='10' r='9' style='fill: rgb(25, 46, 56); opacity: 1;'></circle>
                  <circle class='dot' cx='10' cy='10' r='4' style='fill: rgb(68, 195, 171);'></circle>
                  <path class='outer_circle' d='M10,2a8,8,0,1,1-8,8,8.009,8.009,0,0,1,8-8m0-2A10,10,0,1,0,20,10,10,10,0,0,0,10,0Z' style='fill: rgb(160, 160, 160);'></path>
                </svg>`,
                children: (() => {
                  const children = [
                    {
                      tagName: 'span',
                      className: 'text font',
                      innerHTML: `${option.value}`,
                    },
                  ];
                  if (option.type === 'slider') {
                    children.push({
                      tagName: 'input',
                      type: 'range',
                      min: option.min,
                      max: option.max,
                      step: option.step,
                      callback: (element) => {
                        element.addEventListener('input', ({ target: { value } }) => {
                          option.value = value;
                        });
                      },
                    });
                  }
                  return children;
                })(),
                callback: (element) => {
                  element.addEventListener('click', () => {
                    callback(option.value, true);
                  });
                },
              });
              elementByValues[option.type || option.value] = { element, option };
              return element;
            }, {}),
          },
        ],
      }),
      firstElementChild,
    );
    document.getElementById('player0').addEventListener('ratechange', ({ target: { playbackRate } }) => {
      if (!playbackRate) return;
      displayValue.innerText = playbackRate;
      const key = playbackRate in elementByValues ? playbackRate : 'slider';
      const {
        [key]: { element, option },
      } = elementByValues;
      const selected = document.querySelector('.ic_option[value=true]');
      if (selected) selected.setAttribute('value', 'false');
      element.setAttribute('value', 'true');
      localStorage.setItem(`Vilos:${type}`, `${playbackRate}`);
      if (key === 'slider') {
        element.querySelector('.font').innerHTML = playbackRate;
        option.value = playbackRate;
      }
    });
  });

  new MutationObserver(() => {
    velocitySettingsMenu.setAttribute(
      'ic_options',
      velocitySettingsMenu.querySelector('[data-testid="vilos-settings_back_button"]') ? 'submenu' : '',
    );
  }).observe(velocitySettingsMenu, {
    childList: true,
  });
}

function insertCbpDivs(vilosControlsContainer) {
  if (document.body.contains(icDivPlayerControls)) return;
  const controlsBar =
    vilosControlsContainer.firstElementChild &&
    (vilosControlsContainer.firstElementChild.lastElementChild.children[2] ||
      vilosControlsContainer.firstElementChild.firstElementChild);
  if (!controlsBar) return;
  const controlsBarLeft = controlsBar.firstElementChild;
  const controlsBarRight = controlsBar.lastElementChild;

  controlsBarLeft.appendChild(icDivPlayerControls);
  controlsBarRight.insertBefore(icDivPlayerMode, controlsBarRight.children[1]);
}

function shortcutHandler() {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.fast_backward_buttons || changes.fast_forward_buttons) {
      createFastForwardBackwardButtons();
    }
  });
  window.addEventListener(
    'keydown',
    (ev) => {
      const key = shortcutUtils.eventToKey(ev);
      Object.entries({
        forward,
        backward,
        speedUp: (value) => setPlaybackRate(document.getElementById('player0').playbackRate + +value, true),
        speedDown: (value) => setPlaybackRate(document.getElementById('player0').playbackRate - +value, true),
        skip: () => {
          if (activeSkipper && activeSkipper.element && typeof activeSkipper.element.click === 'function') {
            activeSkipper.element.click();
          }
        },
        ...[
          ['toggleHideUiWhilePlaying', 'playing'],
          ['toggleHideUiWhileFullscreen', 'fullscreen'],
          ['toggleHideUiWhilePlayingOrFullscreen', 'playingOrFullscreen'],
          ['toggleHideUiWhilePlayingAndFullscreen', 'playingAndFullscreen'],
        ].reduce(
          (acc, [type, value]) => ({
            ...acc,
            [type]: () =>
              document.documentElement.setAttribute(
                'ic_hide_ui',
                (document.documentElement.getAttribute('ic_hide_ui') !== value && value) || '',
              ),
          }),
          {},
        ),
      }).forEach(([type, fn]) => {
        const {
          shortcuts: { [type]: shortcut },
          disable_numpad,
        } = chromeStorage;
        if (!shortcut) return;
        if (shortcut === key) {
          fn();
        } else if (typeof shortcut === 'object' && key in shortcut) {
          fn(shortcut[key]);
        } else if (!disable_numpad || ev.location !== 3) {
          return;
        }
        ev.stopPropagation();
      });
    },
    true,
  );
}

function createSkipper(skipper, player) {
  const element = document.createElement('div');
  element.className = 'ic_skipper';
  element.addEventListener('click', () => {
    skipper.skipped = true;
    element.classList.remove('active');
    forward(skipper.end - player.currentTime);
  });
  [translate('skipTo'), parseNumber(skipper.end)].forEach((text) => {
    const span = document.createElement('span');
    span.innerText = text;
    element.appendChild(span);
  });
  skipper.element = element;
  return element;
}

function skippersHandler() {
  let mediaId;
  window.addEventListener('message', ({ data }) => {
    const { method, value } = JSON.parse(data);
    if (method === 'loadConfig' || method === 'extendConfig') {
      const {
        media: {
          metadata: { id },
        },
      } = value;
      if (id && id !== mediaId) {
        mediaId = id;
        chrome.runtime.sendMessage(chrome.runtime.id, { type: 'skippers', data: value }, (skippers) => {
          if (Array.isArray(skippers)) {
            const player = document.getElementById('player0');
            let lastTime;
            skippers.forEach((skipper) => document.body.appendChild(createSkipper(skipper, player)));
            const timeupdate = () => {
              const currentTime = ~~player.currentTime;
              if (lastTime !== currentTime) {
                lastTime = currentTime;
                skippers.forEach((skipper) => {
                  if (skipper.end > currentTime + 1 && currentTime > skipper.start) {
                    activeSkipper = skipper;
                    skipper.element.classList.add('active');
                    if (currentTime - 5 >= skipper.start) {
                      skipper.element.classList.add('past');
                    } else {
                      skipper.element.classList.remove('past');
                    }
                    if (chromeStorage.auto_skip && !skipper.skipped) {
                      skipper.element.click();
                    }
                  } else {
                    skipper.element.classList.remove('active');
                    if (skipper === activeSkipper) {
                      activeSkipper = undefined;
                    }
                  }
                });
              }
            };
            player.addEventListener('timeupdate', timeupdate);
            player.addEventListener(
              'loadstart',
              () => {
                player.removeEventListener('timeupdate', timeupdate);
              },
              { once: true },
            );
          }
        });
      }
    }
  });
}

const icDivPlayerControls = document.createElement('div');
const icDivPlayerMode = document.createElement('div');
let activeSkipper;

skippersHandler();
new MutationObserver((_, observer) => {
  const vilos = document.getElementById('vilos');
  if (!vilos) return;
  observer.disconnect();
  document.onfullscreenchange = () => {
    document.documentElement.setAttribute('ic_fullscreen', `${!!document.fullscreenElement}`);
  };
  chromeStorage.reload(
    'hide_dim_screen',
    'hide_play_pause_button',
    'hide_skip_button',
    'hide_subtitles',
    'hide_ui',
    'runnerThumbnail',
    'player_mode',
    'scrollbar',
  );
  new MutationObserver((_, observer) => {
    observer.disconnect();
    playingHandler();
    createAndInsertSvgDefs();
    createDivs();
    shortcutHandler();
    new MutationObserver((mutations) => {
      const velocityControlsPackage = mutations.reduce(
        (f, { addedNodes }) => f || [...addedNodes].find(({ id }) => id === 'velocity-controls-package'),
        false,
      );
      if (!velocityControlsPackage) return;
      createAndInsertSettings();
      new MutationObserver((mutations) => {
        const vilosControlsContainer = mutations.reduce(
          (f, { addedNodes }) => f || [...addedNodes].find(({ id }) => id === 'vilosControlsContainer'),
          false,
        );
        document.documentElement.setAttribute('ic_vilos_controls', `${!!vilosControlsContainer}`);
        if (vilosControlsContainer) {
          insertCbpDivs(vilosControlsContainer);
          new MutationObserver(() => {
            insertCbpDivs(vilosControlsContainer);
          }).observe(vilosControlsContainer, {
            childList: true,
          });
        }
      }).observe(velocityControlsPackage, {
        childList: true,
      });
    }).observe(document.getElementById('vilosRoot'), {
      childList: true,
    });
  }).observe(vilos, {
    childList: true,
  });
}).observe(document.documentElement, {
  childList: true,
});
