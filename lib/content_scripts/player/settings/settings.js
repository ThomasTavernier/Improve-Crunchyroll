function createSettings() {
  return [
    {
      title: Renderer.translate('playbackRate'),
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
    const displayValue = new Renderer('span').addClass('font');
    const elementByValues = {};
    const settings = new Renderer('div').setAttribute('id', type).addClass('ic_settings');
    const elements = [
      new Renderer('div')
        .setAttribute('id', `ic_${type}_menu`)
        .addClass('ic_menu')
        .appendChildren(
          new Renderer('div').addClass('font').setText(title),
          new Renderer('div')
            .addClass('right')
            .appendChildren(
              new Renderer('div').addClass('right_text').appendChildren(displayValue),
              new Renderer('div').addClass('next'),
            ),
        )
        .addEventListener('click', () => {
          document.getElementById('velocity-settings-menu').setAttribute('ic_options', 'hide');
          settings.addClass('ic_show');
        })
        .getElement(),
      settings
        .appendChildren(
          new Renderer('div')
            .addClass('ic_back')
            .appendChildren(new Renderer('div').addClass('back'), new Renderer('div').addClass('font').setText(title))
            .addEventListener('click', () => {
              document.getElementById('velocity-settings-menu').removeAttribute('ic_options');
              settings.removeClass('ic_show');
            }),
          new Renderer('div')
            .setAttribute('id', type)
            .addClass('ic_options')
            .appendChildren(
              ...values.map((option) => {
                const element = new Renderer('div')
                  .addClass('ic_option')
                  .appendChildren(
                    new SvgRenderer('svg')
                      .setAttribute('viewBox', '0 0 20 20')
                      .setStyle('height', '20px')
                      .setStyle('width', '20px')
                      .appendChildren(
                        new SvgRenderer('circle')
                          .setAttribute('class', 'bg')
                          .setAttribute('cx', 10)
                          .setAttribute('cy', 10)
                          .setAttribute('r', 9)
                          .setStyle('fill', 'rgb(25, 46, 56)')
                          .setStyle('opacity', 1),
                        new SvgRenderer('circle')
                          .setAttribute('class', 'dot')
                          .setAttribute('cx', 10)
                          .setAttribute('cy', 10)
                          .setAttribute('r', 4)
                          .setStyle('fill', 'rgb(68, 195, 171)'),
                        new SvgRenderer('path')
                          .setAttribute('class', 'outer_circle')
                          .setAttribute(
                            'd',
                            'M10,2a8,8,0,1,1-8,8,8.009,8.009,0,0,1,8-8m0-2A10,10,0,1,0,20,10,10,10,0,0,0,10,0Z',
                          )
                          .setStyle('fill', 'rgb(160, 160, 160)'),
                      ),
                    new Renderer('span').addClass('text', 'font').setText(option.value),
                  )
                  .addEventListener('click', () => {
                    callback(option.value, true);
                  });
                if (option.type === 'slider') {
                  element.appendChildren(
                    new Renderer('input')
                      .setAttribute('type', 'range')
                      .setAttribute('min', option.min)
                      .setAttribute('max', option.max)
                      .setAttribute('step', option.step)
                      .addEventListener('input', ({ target: { value } }) => {
                        option.value = value;
                      }),
                  );
                }
                elementByValues[option.type || option.value] = { element, option };
                return element;
              }),
            )
            .getElement(),
        )
        .getElement(),
    ];
    let player = document.getElementById('player0');
    player.addEventListener('ratechange', ({ target: { playbackRate } }) => {
      if (!playbackRate) return;
      displayValue.setText(playbackRate);
      const key = playbackRate in elementByValues ? playbackRate : 'slider';
      const {
        [key]: { element, option },
      } = elementByValues;
      Object.values(elementByValues).forEach(({ element: ele })=> {
        ele.setAttribute('value', 'false');
      });
      element.setAttribute('value', 'true');
      if (key === 'slider') {
        element.getElement().querySelector('.font').innerText = playbackRate;
        option.value = playbackRate;
      }
    });
    player.addEventListener('canplay', () => {
      setPlaybackRate()
    });
    return elements;
  });
}

function insertSettings(velocitySettingsMenu, elements) {
  const child = velocitySettingsMenu.firstElementChild;
  elements.forEach((element) => velocitySettingsMenu.insertBefore(element, child));
  new MutationObserver(() => {
    const subMenu = !!velocitySettingsMenu.querySelector('[data-testid="vilos-settings_back_button"]');
    if (subMenu) {
      velocitySettingsMenu.setAttribute('ic_options', 'submenu');
      velocitySettingsMenu.querySelector('.ic_settings.ic_show')?.classList.remove('ic_show');
    } else {
      velocitySettingsMenu.setAttribute('ic_options', '');
    }
  }).observe(child, {
    childList: true,
  });
}
