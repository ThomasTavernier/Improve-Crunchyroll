core.components.shortcut = (object) => {
  const component = new Renderer('div').setAttribute('tabindex', '0').addClass('shortcut');

  const render = (value) => {
    component.removeChildren().appendChildren(
      ...shortcutUtils.renderKey(value).map((value) => {
        return new Renderer('span').setText(value);
      }),
    );
  };
  if (object.key) {
    render(object.key);
  } else {
    component.setText(Renderer.translate(object.label));
  }
  component.addEventListener('keydown', (ev) => {
    const shortcut = shortcutUtils.eventToKey(ev);
    object.onChange(shortcut);
    render(shortcut);
  });

  setTimeout(() => component.focus());

  return component;
};
