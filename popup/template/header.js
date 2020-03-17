core.header = {
  type: 'header',
  label: 'extName',

  content: {
    type: 'button',
    class: ['returnButton'],
    innerHTML:
      '<svg viewBox="0 0 24 24"><path d="M9.929,12l3.821-3.821c0.414-0.414,0.414-1.086,0-1.5l0,0c-0.414-0.414-1.086-0.414-1.5,0l-4.614,4.614 c-0.391,0.391-0.391,1.024,0,1.414l4.614,4.614c0.414,0.414,1.086,0.414,1.5,0h0c0.414-0.414,0.414-1.086,0-1.5L9.929,12z"></path></svg>',
    on: {
      click: () => {
        core.nav.goBack();
      },
    },
  },
};
