core.components.button = (object) => {
  const component = new InputRenderer('button').setDisabled(object.disabled);
  if (object.text) {
    component.setText(Renderer.translate(object.text));
  } else if (object.child) {
    component.appendChildren(object.child);
  }
  object.setDisabled = (disabled) => {
    component.setDisabled(disabled);
  };
  return component;
};
