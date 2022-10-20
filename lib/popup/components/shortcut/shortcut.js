core.components.shortcut = (object) => {
  const component = document.createElement('div');
  component.setAttribute('tabindex', '0');
  component.className = 'shortcut';

  const render = (value) => {
    component.innerHTML = shortcutUtils
      .renderKey(value)
      .map((value) => `<span>${value}</span>`)
      .join('+');
  };
  if (object.key) {
    render(object.key);
  } else {
    component.innerText = core.translate(object.label);
  }
  component.addEventListener('keydown', (ev) => {
    const shortcut = shortcutUtils.eventToKey(ev);
    object.onChange(shortcut);
    render(shortcut);
  });

  setTimeout(() => component.focus());

  return component;
};
