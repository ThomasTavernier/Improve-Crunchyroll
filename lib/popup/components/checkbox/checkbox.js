core.components.checkbox = (object) => {
  const component = core.components.item(object);
  const key = object.key;
  let value = chromeStorage[key];

  const switch_component = core.components.switch();
  switch_component.setAttribute('value', value);
  component.appendChild(switch_component);

  component.addEventListener('click', () => {
    value = !value;
    chromeStorage[key] = value;
    switch_component.setAttribute('value', value);
  });

  return component;
};
