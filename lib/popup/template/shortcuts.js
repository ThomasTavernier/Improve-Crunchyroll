function createShortcut(type, label) {
  const shortcut = {
    type: 'item',
    label: label,
    on: {
      click: () => {
        const key = chromeStorage.shortcuts[type];
        let newKey = key;
        core.popup.custom(
          {
            span: {
              type: 'item',
              label,
            },
            shortcut: {
              type: 'shortcut',
              label: 'none',
              key,
              onChange: (value) => {
                newKey = value;
              },
            },
          },
          {
            cancel: {
              type: 'button',
              text: 'cancel',
              on: {
                click: () => core.popup.close(),
              },
            },
            delete: {
              type: 'button',
              text: 'unset',
              on: {
                click: () => {
                  chromeStorage.shortcuts = { ...chromeStorage.shortcuts, [type]: undefined };
                  core.popup.close();
                },
              },
            },
            save: {
              type: 'button',
              text: 'save',
              on: {
                click: () => {
                  chromeStorage.shortcuts = { ...chromeStorage.shortcuts, [type]: newKey };
                  core.popup.close();
                },
              },
            },
          },
        );
      },
    },
  };
  chromeStorage.LOADED.then(() => {
    shortcut.subLabel = shortcutUtils.renderKeyJoinByPlus(chromeStorage.shortcuts[type]) || 'none';
    chrome.storage.onChanged.addListener((changes) => {
      if (
        changes.shortcuts &&
        (!changes.shortcuts.oldValue || changes.shortcuts.newValue[type] !== changes.shortcuts.oldValue[type])
      ) {
        setTimeout(() => {
          const subLabel = shortcutUtils.renderKeyJoinByPlus(chromeStorage.shortcuts[type]) || 'none';
          if (typeof shortcut.setSubLabel === 'function') {
            shortcut.setSubLabel(subLabel);
          } else {
            shortcut.subLabel = subLabel;
          }
        });
      }
    });
  });
  return shortcut;
}

function createShortcutWithValue({ type, label, inputOption }) {
  return {
    type: 'item',
    label,
    on: {
      click: () => {
        (goTo = (replace) => {
          core.nav.goTo(
            {
              label: `${label}Shortcuts`,
              type: 'main',

              content: {
                section: {
                  type: 'section',

                  content: {
                    ...[
                      ['+'],
                      ...Object.entries((chromeStorage.shortcuts && chromeStorage.shortcuts[type]) || {}),
                    ].reduce((acc, [key, value], index) => {
                      const isAdd = key === '+';
                      acc[index] = {
                        type: 'item',
                        label: shortcutUtils.renderKey(key).join(' + '),
                        subLabel: `${value || ''}`,
                        class: isAdd ? ['center'] : undefined,
                        on: {
                          click: () => {
                            let newKey = key;
                            let newValue = value;
                            const save = {
                              type: 'button',
                              text: 'save',
                              disabled: !value,
                              setDisabled: true,
                              on: {
                                click: () => {
                                  const shortcuts = chromeStorage.shortcuts;
                                  delete chromeStorage.shortcuts[type][key];
                                  shortcuts[type][newKey] = newValue;
                                  chromeStorage.shortcuts = shortcuts;
                                  core.popup.close();
                                  goTo(true);
                                },
                              },
                            };
                            core.popup.custom(
                              {
                                span: {
                                  type: 'item',
                                  label: `${isAdd ? 'add' : 'edit'}${label}Shortcut`,
                                },
                                shortcut: {
                                  type: 'shortcut',
                                  label: 'pressAnyKey',
                                  key: !isAdd && key,
                                  onChange: (value) => {
                                    newKey = value;
                                    save.setDisabled(newKey === '+' || !newValue);
                                  },
                                },
                                value: {
                                  type: 'input',
                                  inputType: 'number',
                                  label: 'value',
                                  required: true,
                                  ...(inputOption || {}),
                                  value: newValue,
                                  on: {
                                    input: (ev) => {
                                      newValue = ev.target.value;
                                      save.setDisabled(newKey === '+' || !newValue);
                                    },
                                  },
                                },
                              },
                              {
                                delete: {
                                  type: 'button',
                                  text: 'delete',
                                  hide: isAdd,
                                  on: {
                                    click: () => {
                                      const shortcuts = chromeStorage.shortcuts;
                                      delete chromeStorage.shortcuts[type][key];
                                      chromeStorage.shortcuts = shortcuts;
                                      core.popup.close();
                                      goTo(true);
                                    },
                                  },
                                },
                                cancel: {
                                  type: 'button',
                                  text: 'cancel',
                                  on: {
                                    click: () => {
                                      core.popup.close();
                                    },
                                  },
                                },
                                save,
                              },
                            );
                          },
                        },
                      };
                      return acc;
                    }, {}),
                  },
                },
              },
            },
            replace,
          );
        })(false);
      },
    },
  };
}

core.main.shortcuts = {
  type: 'folder',
  label: 'shortcuts',
  icon: new SvgRenderer('svg')
    .setAttribute('viewBox', '0 0 172 172')
    .appendChildren(
      new SvgRenderer('path').setAttribute(
        'd',
        'M44.72,10.32c-18.95899,0 -34.4,15.44101 -34.4,34.4v82.56c0,18.95899 15.44101,34.4 34.4,34.4h82.56c18.95899,0 34.4,-15.44101 34.4,-34.4v-82.56c0,-18.95899 -15.44101,-34.4 -34.4,-34.4zM44.72,17.2h82.56c15.24149,0 27.52,12.27851 27.52,27.52v82.56c0,15.24149 -12.27851,27.52 -27.52,27.52h-82.56c-15.24149,0 -27.52,-12.27851 -27.52,-27.52v-82.56c0,-15.24149 12.27851,-27.52 27.52,-27.52zM86,30.96c-4.54304,0 -9.08713,1.46433 -12.85969,4.38735l-31.30266,24.24125c-5.10575,3.95136 -5.27908,11.78372 -0.34937,15.95031c0.00224,0 0.00448,0 0.00672,0l11.55625,9.76235l-11.22031,8.68735c-5.1012,3.95178 -5.27325,11.78296 -0.34265,15.95031l30.96672,26.16281c7.79276,6.57964 19.29724,6.57964 27.09,0l30.96,-26.16281c4.92874,-4.16536 4.76273,-11.99923 -0.34265,-15.95031l-11.2136,-8.68063l11.56297,-9.76906c4.92873,-4.16536 4.76273,-11.99923 -0.34265,-15.95031l-31.30938,-24.24797v0.00672c-3.77271,-2.92318 -8.31664,-4.38735 -12.85969,-4.38735zM86,37.83328c3.0542,0 6.11063,0.9843 8.64703,2.94953l31.30937,24.24797c1.80064,1.39352 1.84778,3.79065 0.11422,5.25406l-12.685,10.7164l-14.52594,-11.2539c-3.77271,-2.92301 -8.31664,-4.38735 -12.85969,-4.38735c-4.54005,0 -9.08188,1.46145 -12.85297,4.38063l-0.01344,-0.01344l-8.97625,6.94719l5.40187,4.57547l7.80719,-6.0536l-0.01344,-0.01344c5.07281,-3.93046 12.21454,-3.93046 17.28735,0c0.00224,0 0.00448,0 0.00672,0l13.37031,10.35359l-12.90672,10.90453c-5.24484,4.42836 -12.9697,4.42836 -18.21453,0l-30.96672,-26.15609c-1.73701,-1.46813 -1.68084,-3.85967 0.12094,-5.25406l31.30265,-24.24797c0.00224,0 0.00448,0 0.00672,0c2.53625,-1.96523 5.58612,-2.94953 8.64031,-2.94953zM58.42625,89.84313l14.02875,11.85859c7.79276,6.57964 19.29724,6.57964 27.09,0l14.02875,-11.85187l12.37594,9.58094c1.80064,1.39352 1.85448,3.79065 0.12094,5.25406l-30.96672,26.15609c-5.24483,4.42836 -12.96969,4.42836 -18.21453,0l-30.96,-26.15609c-1.73612,-1.46737 -1.6852,-3.86008 0.11422,-5.25406z',
      ),
    ),

  content: {
    type: 'main',
    label: 'shortcuts',

    content: {
      section: {
        type: 'main',

        content: {
          x: {
            type: 'section',

            content: {
              ...[
                ['backward', 'fastBackward'],
                ['forward', 'fastForward'],
              ].reduce((acc, [type, label]) => {
                acc[type] = createShortcutWithValue({
                  type,
                  label,
                  inputOption: {
                    min: 1,
                  },
                });
                return acc;
              }, {}),
              ...[
                ['speedUp', 'speedUp'],
                ['speedDown', 'speedDown'],
              ].reduce((acc, [type, label]) => {
                acc[type] = createShortcutWithValue({
                  type,
                  label,
                  inputOption: {
                    min: 0.05,
                    max: 2,
                    step: 0.05,
                  },
                });
                return acc;
              }, {}),
              skip: createShortcut('skip', 'skip'),
            },
          },
          toggleHideUi: {
            type: 'section',
            label: 'toggleHideUi',

            content: {
              ...[
                ['toggleHideUiWhilePlaying', 'whilePlaying'],
                ['toggleHideUiWhileFullscreen', 'whileFullscreen'],
                ['toggleHideUiWhilePlayingOrFullscreen', 'whilePlayingOrFullscreen'],
                ['toggleHideUiWhilePlayingAndFullscreen', 'whilePlayingAndFullscreen'],
              ].reduce(
                (acc, [type, label]) => ({
                  ...acc,
                  [type]: createShortcut(type, label),
                }),
                {},
              ),
            },
          },
        },
      },
    },
  },
};
