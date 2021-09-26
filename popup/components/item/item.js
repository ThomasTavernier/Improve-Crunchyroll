core.components.item = (object) => {
  const component = document.createElement('div');
  const component_label = document.createElement('span');

  component.className = 'item';

  component_label.innerText = core.translate(object.label);
  component.appendChild(component_label);

  const component_subLabel = document.createElement('span');
  component.appendChild(component_subLabel);
  object.setSubLabel = (subLabel) => (component_subLabel.innerText = core.translate(subLabel));
  if (object.subLabel) {
    object.setSubLabel(object.subLabel);
  }
  return component;
};
