core.components.checkbox = (object) => {
  let component = core.components.item(object.key);
  let key = object.key;
  let value = chromeStorage[key];

  let switch_component = core.components.switch();
  switch_component.setAttribute('value', value);
  component.appendChild(switch_component);

  component.addEventListener('click', () => {
    value = !value;
    chromeStorage[key] = value;
    switch_component.setAttribute('value', value);
  });

  return component;
};
