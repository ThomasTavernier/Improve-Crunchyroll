function createSettings() {
  return [
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
  ].flatMap(({ type, title, values, callback }) => {
    callback(parseFloat(localStorage.getItem(`Vilos:${type}`), false));
    const displayValue = render({
      tagName: 'span',
      className: 'font',
    });
    const elementByValues = {};
    const elements = [
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
    ];
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
    return elements;
  });
}

function insertSettings(velocitySettingsMenu, elements) {
  elements.forEach((element) => velocitySettingsMenu.insertBefore(element, velocitySettingsMenu.firstElementChild));
  new MutationObserver(() => {
    velocitySettingsMenu.setAttribute(
      'ic_options',
      velocitySettingsMenu.querySelector('[data-testid="vilos-settings_back_button"]') ? 'submenu' : '',
    );
  }).observe(velocitySettingsMenu, {
    childList: true,
  });
}
