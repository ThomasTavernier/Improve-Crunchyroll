core.components.checkbox = (object) => {
  const key = object.key;
  let value = chromeStorage[key];

  const switch_component = core.components.switch().setAttribute('value', value);

  return core.components
    .item(object)
    .appendChildren(switch_component)
    .addEventListener('click', () => {
      value = !value;
      chromeStorage[key] = value;
      switch_component.setAttribute('value', value);
    });
};
