core.main.player = {
  type: 'folder',
  label: 'KEY_PLAYER',
  icon: '<svg viewBox="0 0 172 172"><path d="M28.66667,14.33333v143.33333l124.07292,-71.66667z"></path></svg>',

  content: {
    type: 'main',
    label: 'KEY_PLAYER',

    content: {
      player: {
        type: 'section',
        // label: 'KEY_GENERAL',

        content: {
          header_on_hover: {
            type: 'checkbox',
            key: 'header_on_hover',
            label: 'KEY_HEADER_ON_HOVER',
          },
          fast_backward_buttons: {
            type: 'numberList',
            key: 'fast_backward_buttons',
            label: 'KEY_FAST_BACKWARD_BUTTONS',
            placeholder: '30,10',
          },
          fast_forward_buttons: {
            type: 'numberList',
            key: 'fast_forward_buttons',
            label: 'KEY_FAST_FORWARD_BUTTONS',
            placeholder: '30,90',
          },
          hide_subtitles: {
            type: 'checkbox',
            key: 'hide_subtitles',
            label: 'KEY_HIDE_SUBTITLES',
          },
          hide_dim_screen: {
            type: 'checkbox',
            key: 'hide_dim_screen',
            label: 'KEY_HIDE_DIM_SCREEN',
          },
          hide_skip_button: {
            type: 'checkbox',
            key: 'hide_skip_button',
            label: 'KEY_HIDE_SKIP_BUTTON',
          },
        },
      },
    },
  },
};
