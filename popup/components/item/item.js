core.components.item = (object) => {
  const component = document.createElement('div');
  const component_label = document.createElement('span');

  component.className = 'item';

  component_label.innerText = core.translate(object.label);
  component.appendChild(component_label);

  if (object.subLabel) {
    const component_subLabel = document.createElement('span');
    component_subLabel.innerText = core.translate(object.subLabel);
    component.appendChild(component_subLabel);
  }
  return component;
};
