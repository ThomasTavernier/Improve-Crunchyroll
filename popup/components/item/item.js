core.components.item = (object) => {
  const component = document.createElement('div');
  const component_label = document.createElement('span');

  component.className = 'item';

  component_label.innerHTML = core.translate(object.label);
  component.appendChild(component_label);

  return component;
};
