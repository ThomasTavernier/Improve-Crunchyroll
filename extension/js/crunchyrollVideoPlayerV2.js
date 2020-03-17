function parseNumber(number) {
  let numberMinutes = Math.floor(number / 60);
  let numberSeconds = number - numberMinutes * 60;
  return numberMinutes > 0
    ? `${numberMinutes}:${numberSeconds < 10 ? `0${numberSeconds}` : numberSeconds}`
    : numberSeconds;
}

function translate(key) {
  let label = chrome.i18n.getMessage(key);
  return label !== '' ? label : key;
}

function createFastForwardBackwardButtons() {
  cbp_div_player_controls.innerHTML = '';
  let buttonList = [];
  (chromeStorage.fast_backward_buttons.length > 0 ? chromeStorage.fast_backward_buttons.split(',') : []).forEach(
    (fastBackwardNumber) => {
      const fastBackwardButton = document.createElement('div');
      fastBackwardButton.innerHTML = `«${fastBackwardNumber}`;
      fastBackwardButton.id = fastBackwardNumber;
      fastBackwardButton.title = `${chrome.i18n.getMessage('KEY_FAST_BACKWARD')} ${parseNumber(fastBackwardNumber)}`;
      fastBackwardButton.addEventListener(
        'click',
        () => (document.getElementById('player0').currentTime -= ~~event.target.id)
      );
      buttonList.push(fastBackwardButton);
    }
  );
  (chromeStorage.fast_forward_buttons.length > 0 ? chromeStorage.fast_forward_buttons.split(',') : []).forEach(
    (fastForwardNumber) => {
      const fastForwardButton = document.createElement('div');
      fastForwardButton.innerHTML = `${fastForwardNumber}»`;
      fastForwardButton.id = fastForwardNumber;
      fastForwardButton.title = `${chrome.i18n.getMessage('KEY_FAST_FORWARD')} ${parseNumber(fastForwardNumber)}`;
      fastForwardButton.addEventListener(
        'click',
        () => (document.getElementById('player0').currentTime += ~~event.target.id)
      );
      buttonList.push(fastForwardButton);
    }
  );
  buttonList.forEach((button) => {
    button.classList.add('cbp_buttons');
    cbp_div_player_controls.appendChild(button);
  });
}

function createDivs() {
  cbp_div_player_controls = document.createElement('div');
  cbp_div_player_mode = document.createElement('div');
  [cbp_div_player_controls, cbp_div_player_mode].forEach((div) => {
    div.className = 'cbp_div';
    div.addEventListener('mouseup', () => {
      event.stopPropagation();
    });
  });

  createPlayerButton();
  createPlayerSettings();
  createFastForwardBackwardButtons();
}

function scrollBarChange() {
  chrome.storage.local.set({
    scrollbar: chromeStorage.scrollbar ? false : true,
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
    span.className = `cbp_buttons ${button.className}`;
    span.title = chrome.i18n.getMessage(button.title);
    span.addEventListener('click', button.onChange);
    cbp_div_player_mode.appendChild(span);
  });
}

function createSettingsDiv(title, value, type) {
  const div = document.createElement('div');
  div.className = 'cbp_menu';
  div.innerHTML = `
    <div class="font">${title}</div>
    <div class="right">
      <div class="right_text">
        <span class="font" id="cbp_${type}">
          ${value}
        </span>
      </div>
      <div class="next"></div>
    </div>`;
  div.addEventListener('click', () => document.getElementById('vilosSettingsMenu').setAttribute('cbp-options', type));
  return div;
}

function createSettingsOptionsDiv(title, type, options, value, callback) {
  const back = document.createElement('div');
  back.className = `cbp_back cbp_${type}`;
  back.innerHTML = `
    <div class="back"></div>
    <div class="font">${title}</div>`;
  back.addEventListener('click', () => {
    document.getElementById('vilosSettingsMenu').setAttribute('cbp-options', 'menu');
  });
  const submenu = document.createElement('div');
  submenu.id = 'vilosRadioSubmenu';
  submenu.className = `cbp_${type} cbp_options`;
  options.forEach((option) => {
    const subtMenuItem = document.createElement('div');
    const optionValueName = option.name ? translate(option.name) : option.value;
    subtMenuItem.className = 'cbp_option';
    subtMenuItem.innerHTML = `
      <svg viewBox="0 0 20 20" style="height: 20px; width: 20px;">
      <circle
        class="bg"
        cx="10"
        cy="10"
        r="9"
        style="fill: rgb(25, 46, 56); opacity: 1;"
      ></circle>
      <circle
        class="dot"
        cx="10"
        cy="10"
        r="4"
        style="fill: rgb(68, 195, 171);"
      ></circle>
      <path
        class="outer_circle"
        d="M10,2a8,8,0,1,1-8,8,8.009,8.009,0,0,1,8-8m0-2A10,10,0,1,0,20,10,10,10,0,0,0,10,0Z"
        style="fill: rgb(160, 160, 160);"
      ></path>
      </svg>
      <div class="text">
          <span class="font">${optionValueName}</span>
      </div>`;
    subtMenuItem.setAttribute('value', option.value == value);
    subtMenuItem.addEventListener('click', function() {
      const selected = document.querySelector('.cbp_option[value=true]');
      if (selected) selected.setAttribute('value', false);
      this.setAttribute('value', true);
      localStorage.setItem(`Vilos:${type}`, option.value);
      document.getElementById(`cbp_${type}`).innerHTML = optionValueName;
      callback(option.value);
    });
    submenu.appendChild(subtMenuItem);
  });
  return [back, submenu];
}

function createPlayerSettings() {
  cbp_div_settings = [];
  [
    {
      title: 'KEY_PLAYBACK_RATE',
      type: 'playbackRate',
      defaultValue: 1,
      values: [
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
  ]
    .map((setting) => {
      let value = localStorage.getItem(`Vilos:${setting.type}`);
      if (!value) value = setting.defaultValue;
      const title = translate(setting.title);
      let selectedValueName = setting.values.find((v) => v.value == value);
      selectedValueName = selectedValueName
        ? selectedValueName.name
          ? translate(selectedValueName.name)
          : selectedValueName.value
        : value;
      setting.callback(value);
      return [
        createSettingsDiv(title, selectedValueName, setting.type),
        ...createSettingsOptionsDiv(title, setting.type, setting.values, value, setting.callback),
      ];
    })
    .forEach((list) => list.forEach((div) => cbp_div_settings.push(div)));
}

function insertCbpDivs(vilosControlsContainer) {
  const controlsBar = vilosControlsContainer.firstElementChild.lastElementChild.children[2];
  const controlsBarLeft = controlsBar.firstElementChild;
  const controlsBarRight = controlsBar.lastElementChild;
  const controlsBarRightSettingsButton = controlsBarRight.firstElementChild;

  controlsBarLeft.appendChild(cbp_div_player_controls);
  controlsBarRight.insertBefore(cbp_div_player_mode, controlsBarRight.children[1]);

  new MutationObserver((mutationsList) => {
    const vilosSettingsMenu = mutationsList[0].addedNodes[0];
    if (vilosSettingsMenu) {
      vilosSettingsMenu.setAttribute('cbp-options', 'menu');
      const firstElementChild = vilosSettingsMenu.firstElementChild;
      cbp_div_settings.forEach((cbpDivSetting) => {
        vilosSettingsMenu.insertBefore(cbpDivSetting, firstElementChild);
      });
      new MutationObserver(() => {
        vilosSettingsMenu.setAttribute(
          'cbp-options',
          document.querySelector('[data-testid="vilos-settings_back_button"]') ? 'submenu' : 'menu'
        );
      }).observe(vilosSettingsMenu, {
        childList: true,
      });
    }
  }).observe(controlsBarRightSettingsButton, {
    childList: true,
  });
}

function observeVelocityControlsPackageDiv() {
  new MutationObserver((mutationsList) => {
    const addedNode = mutationsList[mutationsList.length - 1].addedNodes[0];
    if (addedNode.hasChildNodes()) insertCbpDivs(addedNode);
  }).observe(document.getElementById('velocity-controls-package'), {
    childList: true,
  });
}

function init() {
  createDivs();
  if (document.getElementById('velocity-controls-package')) {
    observeVelocityControlsPackageDiv();
  } else {
    new MutationObserver((mutationsList, observer) => {
      observer.disconnect();
      observeVelocityControlsPackageDiv();
    }).observe(document.getElementById('vilosRoot'), {
      childList: true,
    });
  }
  document.onfullscreenchange = () => {
    document.documentElement.setAttribute('cbp_fullscreen', document.fullscreenElement ? true : false);
  };
  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.fast_backward_buttons || changes.fast_forward_buttons) {
      createFastForwardBackwardButtons();
    }
  });
}

let cbp_div_player_controls;
let cbp_div_player_mode;
let cbp_div_settings;

setTimeout(init);
