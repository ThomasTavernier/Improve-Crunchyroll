core.main.settings = {
  type: 'folder',
  label: 'settings',
  icon: new SvgRenderer('svg')
    .setAttribute('viewBox', '0 0 226 226')
    .appendChildren(
      new SvgRenderer('path').setAttribute(
        'd',
        'M91.04004,18.83333l-4.63477,23.76237c-7.72881,2.92259 -14.87529,7.00569 -21.15072,12.15706l-22.82438,-7.87174l-21.95996,38.07129l18.26318,15.87223c-0.64755,3.97341 -1.06673,8.01912 -1.06673,12.17546c0,4.15634 0.41919,8.20205 1.06673,12.17546l-18.26318,15.87223l21.95996,38.07128l22.82438,-7.87174c6.27542,5.15138 13.4219,9.23447 21.15072,12.15706l4.63477,23.76237h43.91992l4.63477,-23.76237c7.72881,-2.92258 14.87529,-7.00568 21.15071,-12.15706l22.82439,7.87174l21.95996,-38.07128l-18.26318,-15.87223c0.64755,-3.97341 1.06673,-8.01912 1.06673,-12.17546c0,-4.15634 -0.41918,-8.20205 -1.06673,-12.17546l18.26318,-15.87223l-21.95996,-38.07129l-22.82439,7.87174c-6.27542,-5.15138 -13.4219,-9.23447 -21.15071,-12.15706l-4.63477,-23.76237zM113,75.33333c20.80142,0 37.66667,16.86525 37.66667,37.66667c0,20.80142 -16.86525,37.66667 -37.66667,37.66667c-20.80142,0 -37.66667,-16.86525 -37.66667,-37.66667c0,-20.80142 16.86525,-37.66667 37.66667,-37.66667z',
      ),
    ),

  content: {
    type: 'main',
    label: 'settings',

    content: {
      section: {
        type: 'section',

        content: {
          backupRestoreReset: {
            type: 'item',
            label: 'backupAndReset',
            on: {
              click: () =>
                core.nav.goTo({
                  label: 'backupAndReset',
                  type: 'main',

                  content: {
                    section: {
                      type: 'section',

                      content: {
                        backup: {
                          type: 'item',
                          label: 'backup',
                          on: {
                            click: () => {
                              core.popup.cancelAccept('confirmBackup', () => {
                                chromeStorage.backup(() => {
                                  core.popup.ok('successfullyBackup');
                                });
                              });
                            },
                          },
                        },
                        restore: {
                          type: 'item',
                          label: 'restore',
                          on: {
                            click: () => {
                              core.popup.cancelAccept('confirmRestore', () => {
                                chromeStorage.restore(() => {
                                  core.popup.ok('successfullyRestored');
                                });
                              });
                            },
                          },
                        },
                        reset: {
                          type: 'item',
                          label: 'reset',
                          on: {
                            click: () => {
                              core.popup.cancelAccept('confirmReset', () => {
                                chromeStorage.reset(() => {
                                  core.popup.ok('successfullyReseted');
                                });
                              });
                            },
                          },
                        },
                      },
                    },
                  },
                }),
            },
          },
        },
      },
    },
  },
};
