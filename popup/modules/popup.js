core.popup = {
  close() {
    const popup_container = document.querySelector('.popup_container');
    if (popup_container && popup_container.close) popup_container.close();
  },

  ok(label) {
    this.close();
    core.render(document.body, {
      type: 'popup',

      content: {
        span: {
          type: 'item',
          label,
        },
        section: {
          type: 'section',

          content: {
            ok: {
              type: 'button',
              innerHTML: 'KEY_OK',
              on: {
                click: () => this.close(),
              },
            },
          },
        },
      },
    });
  },

  cancelAccecpt(label, okClick) {
    this.close();
    core.render(document.body, {
      type: 'popup',

      content: {
        span: {
          type: 'item',
          label,
        },
        section: {
          type: 'section',

          content: {
            cancel: {
              type: 'button',
              innerHTML: 'KEY_CANCEL',
              on: {
                click: () => this.close(),
              },
            },
            ok: {
              type: 'button',
              innerHTML: 'KEY_ACCEPT',
              on: {
                click: okClick,
              },
            },
          },
        },
      },
    });
  },
};
