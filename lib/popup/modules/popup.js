core.popup = {
  close() {
    const popup_container = document.querySelector('.popup_container');
    if (popup_container && popup_container.close) popup_container.close();
  },

  custom(body, buttons) {
    this.close();
    core.renderAndAppend(document.body, {
      type: 'popup',

      content: {
        ...(body || {}),
        section: {
          type: 'section',

          content: {
            ...Object.entries(buttons).reduce((acc, [key, button]) => {
              acc[key] = button;
              acc[key].type = 'button';
              return acc;
            }, {}),
          },
        },
      },
    });
  },

  ok(label) {
    this.custom(
      {
        span: {
          type: 'item',
          label,
        },
      },
      {
        ok: {
          type: 'button',
          text: 'ok',
          on: {
            click: () => this.close(),
          },
        },
      },
    );
  },

  cancelAccept(label, okClick) {
    this.custom(
      {
        span: {
          type: 'item',
          label,
        },
      },
      {
        cancel: {
          type: 'button',
          text: 'cancel',
          on: {
            click: () => this.close(),
          },
        },
        ok: {
          type: 'button',
          text: 'accept',
          on: {
            click: okClick,
          },
        },
      },
    );
  },
};
