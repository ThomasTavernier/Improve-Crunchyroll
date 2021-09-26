core.components.button = (object) => {
  const component = document.createElement('button');
  component.innerHTML = core.translate(object.innerHTML);
  component.disabled = object.disabled;
  object.setDisabled = (disabled) => {
    component.disabled = disabled;
  };
  return component;
};
