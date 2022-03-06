core.main.general = {
  type: 'folder',
  label: 'general',
  icon: '<svg viewBox="0 0 226 226"><path d="M84.75,18.83333v18.83333h-65.91667v18.83333h65.91667v18.83333h28.25v-56.5zM131.83333,37.66667v18.83333h75.33333v-18.83333zM131.83333,84.75v18.83333h-113v18.83333h113v18.83333h28.25v-56.5zM178.91667,103.58333v18.83333h28.25v-18.83333zM37.66667,150.66667v18.83333h-18.83333v18.83333h18.83333v18.83333h28.25v-56.5zM84.75,169.5v18.83333h122.41667v-18.83333z"></path></svg>',

  content: {
    type: 'main',
    label: 'general',

    content: {
      general: {
        type: 'section',
        // label: 'general',

        content: {
          hide_banner: {
            type: 'checkbox',
            key: 'hide_banner',
            label: 'hideBanner',
          },
          hide_background_image: {
            type: 'checkbox',
            key: 'hide_background_image',
            label: 'hideBackgroundImage',
          },
          hide_message_box: {
            type: 'checkbox',
            key: 'hide_message_box',
            label: 'hideMessageBox',
          },
        },
      },
    },
  },
};
