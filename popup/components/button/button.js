core.components.button = (object) => {
  const component = document.createElement('button');
  component.innerHTML = core.translate(object.innerHTML);

  return component;
};
