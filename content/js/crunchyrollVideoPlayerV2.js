function parseNumber(number) {
  return [2, 1, 0]
    .map((v) => ~~((number % Math.pow(60, v + 1)) / Math.pow(60, v)))
    .reduce((acc, value) => (acc ? `${acc}:${value < 10 ? '0' : ''}${value}` : `${value || ''}`), '');
}

function translate(key) {
  const label = chrome.i18n.getMessage(key);
  return label !== '' ? label : key;
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
  svg.addEventListener('transitionend', () => {
    svg.remove();
  });
  document.getElementById('velocity-controls-package').appendChild(svg).focus({ preventScroll: true });
  svg.classList.add('ic_remove');
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
      fastBackwardButton.title = `${chrome.i18n.getMessage('KEY_FAST_BACKWARD')} ${parseNumber(fastBackwardNumber)}`;
      fastBackwardButton.addEventListener('click', () => backward(fastBackwardNumber));
      buttonList.push(fastBackwardButton);
    },
  );
  (chromeStorage.fast_forward_buttons.length > 0 ? chromeStorage.fast_forward_buttons.split(',') : []).forEach(
    (fastForwardNumber) => {
      const fastForwardButton = document.createElement('div');
      fastForwardButton.appendChild(createSvgForwardBackward('forward', fastForwardNumber));
      fastForwardButton.title = `${chrome.i18n.getMessage('KEY_FAST_FORWARD')} ${parseNumber(fastForwardNumber)}`;
      fastForwardButton.addEventListener('click', () => forward(fastForwardNumber));
      buttonList.push(fastForwardButton);
    },
  );
  buttonList.forEach((button) => {
    button.classList.add('ic_buttons');
    icDivPlayerControls.appendChild(button);
  });
}

function createAndInsertSvgDefs() {
  Promise.all(['forward', 'backward'].map((file) => fetch(chrome.extension.getURL(`/resources/${file}.html`))))
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
  createFastForwardBackwardButtons();
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
      title: 'KEY_SCROLLBAR',
      onChange: scrollBarChange,
    },
    {
      className: 'theater_mode',
      chromeStorageKey: 'theater_mode',
      title: 'KEY_THEATER_MODE',
      onChange: playerMode1Change,
    },
    {
      className: 'fullscreen_mode',
      chromeStorageKey: 'player_mode',
      eq: 2,
      title: 'KEY_FULLSCREEN_MODE',
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

function createSettingsDiv(title, value, type) {
  const div = document.createElement('div');
  div.className = 'ic_menu';
  div.id = `ic_${type}_menu`;
  div.innerHTML = `
    <div class='font'>${title}</div>
    <div class='right'>
      <div class='right_text'>
        <span class='font'>
          ${value}
        </span>
      </div>
      <div class='next'></div>
    </div>`;
  div.addEventListener('click', () => {
    document.getElementById('velocity-settings-menu').setAttribute('ic_options', 'hide');
    window.location.hash = type;
  });
  return div;
}

function createSettingsOptionsDiv(title, type, options, value, callback) {
  const div = document.createElement('div');
  div.id = type;
  div.className = 'ic_settings';
  const back = document.createElement('div');
  div.appendChild(back);
  back.className = `ic_back`;
  back.innerHTML = `
    <div class='back'></div>
    <div class='font'>${title}</div>`;
  back.addEventListener('click', () => {
    document.getElementById('velocity-settings-menu').removeAttribute('ic_options');
  });
  const optionsDiv = document.createElement('div');
  div.appendChild(optionsDiv);
  optionsDiv.className = `ic_options`;
  options.forEach((option) => {
    const optionDIv = document.createElement('div');
    let optionValueName = option.name ? translate(option.name) : option.value;
    optionDIv.className = 'ic_option';
    optionDIv.innerHTML = `
      <svg viewBox='0 0 20 20' style='height: 20px; width: 20px;'>
      <circle
        class='bg'
        cx='10'
        cy='10'
        r='9'
        style='fill: rgb(25, 46, 56); opacity: 1;'
      ></circle>
      <circle
        class='dot'
        cx='10'
        cy='10'
        r='4'
        style='fill: rgb(68, 195, 171);'
      ></circle>
      <path
        class='outer_circle'
        d='M10,2a8,8,0,1,1-8,8,8.009,8.009,0,0,1,8-8m0-2A10,10,0,1,0,20,10,10,10,0,0,0,10,0Z'
        style='fill: rgb(160, 160, 160);'
      ></path>
      </svg>`;
    const name = document.createElement('span');
    name.className = 'text font';
    name.innerHTML = `${option.value}`;
    optionDIv.appendChild(name);
    if (option.type === 'slider') {
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = option.min;
      slider.max = option.max;
      slider.value = `${option.value}`;
      slider.step = option.step;
      slider.addEventListener('input', () => {
        const sliderValue = parseFloat(slider.value);
        if (sliderValue === sliderValue) {
          option.value = sliderValue;
          optionValueName = sliderValue;
          name.innerHTML = `${option.value}`;
        }
      });
      optionDIv.appendChild(slider);
    }
    optionDIv.setAttribute('value', `${option.value === value}`);
    optionDIv.addEventListener('click', () => {
      const selected = document.querySelector('.ic_option[value=true]');
      if (selected) selected.setAttribute('value', 'false');
      optionDIv.setAttribute('value', 'true');
      localStorage.setItem(`Vilos:${type}`, `${option.value}`);
      document.querySelector(`#ic_${type}_menu .right_text .font`).innerHTML = optionValueName;
      callback(option.value);
    });
    optionsDiv.appendChild(optionDIv);
  });
  return div;
}

function createAndInsertSettings() {
  const velocitySettingsMenu = document.getElementById('velocity-settings-menu');
  const firstElementChild = velocitySettingsMenu.firstElementChild;
  [
    {
      title: 'KEY_PLAYBACK_RATE',
      type: 'playbackRate',
      defaultValue: 1,
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
          name: 'KEY_NORMAL',
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
      callback: (value) => (document.getElementById('player0').playbackRate = value),
    },
  ].forEach((setting) => {
    const localStorageValue = parseFloat(localStorage.getItem(`Vilos:${setting.type}`));
    const value = localStorageValue === localStorageValue ? localStorageValue : setting.defaultValue;
    const title = translate(setting.title);
    const selectedValue = setting.values.find((v) => v.value === value);
    let selectedValueName;
    setting.callback(value);
    if (selectedValue) {
      selectedValueName = selectedValue.name ? translate(selectedValue.name) : selectedValue.value;
    } else {
      selectedValueName = value;
      const slider = setting.values.find((value) => value.type === 'slider');
      if (slider) slider.value = value;
    }
    velocitySettingsMenu.insertBefore(createSettingsDiv(title, selectedValueName, setting.type), firstElementChild);
    velocitySettingsMenu.insertBefore(
      createSettingsOptionsDiv(title, setting.type, setting.values, value, setting.callback),
      firstElementChild,
    );
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
  const controlsBar = vilosControlsContainer.firstElementChild.lastElementChild.children[2];
  if (!controlsBar) return;
  const controlsBarLeft = controlsBar.firstElementChild;
  const controlsBarRight = controlsBar.lastElementChild;

  controlsBarLeft.appendChild(icDivPlayerControls);
  controlsBarRight.insertBefore(icDivPlayerMode, controlsBarRight.children[1]);
}

function shortcutHandler() {
  chrome.storage.local.onChanged.addListener((changes) => {
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
        skip: () => {
          if (activeSkipper && activeSkipper.element && typeof activeSkipper.element.click === 'function') {
            activeSkipper.element.click();
          }
        },
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
    true
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
  [translate('KEY_SKIP_TO'), parseNumber(skipper.end)].forEach((text) => {
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
    'player_mode',
    'scrollbar',
  );
  new MutationObserver((_, observer) => {
    observer.disconnect();
    new MutationObserver((_, observer) => {
      observer.disconnect();
      createAndInsertSvgDefs();
      createAndInsertSettings();
      createDivs();
      shortcutHandler();
      new MutationObserver((mutations) => {
        mutations.some(({ addedNodes }) =>
          [...addedNodes].some((node) => {
            if (node.id === 'vilosControlsContainer' && node.hasChildNodes()) {
              document.documentElement.setAttribute('ic_vilos_controls', 'true');
              insertCbpDivs(node);
              return true;
            } else {
              document.documentElement.setAttribute('ic_vilos_controls', 'false');
            }
          }),
        );
      }).observe(document.getElementById('velocity-controls-package'), {
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
