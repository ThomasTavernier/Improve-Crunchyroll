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
  if (object.label.startsWith('KEY_')) {
    component.innerText = core.translate(object.label);
  } else {
    render(object.label);
  }
  component.addEventListener('keydown', (ev) => {
    const shortcut = shortcutUtils.eventToKey(ev);
    object.onChange(shortcut);
    render(shortcut);
  });

  setTimeout(() => component.focus());

  return component;
};
