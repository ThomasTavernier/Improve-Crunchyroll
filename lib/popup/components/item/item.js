core.components.item = (object) => {
  const component_subLabel = new Renderer('span');
  object.setSubLabel = (subLabel) => component_subLabel.setText(Renderer.translate(subLabel));
  if (object.subLabel) {
    object.setSubLabel(object.subLabel);
  }
  return new Renderer('div')
    .addClass('item')
    .appendChildren(new Renderer('span').setText(Renderer.translate(object.label)), component_subLabel);
};
