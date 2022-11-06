core.render = (object) => {
  const child = core.components[object.type](object);
  if (object.class) {
    child.addClass(object.class);
  }
  if (object.hide) {
    child.setStyle('display', 'none');
  }

  if (object.on) {
    Object.entries(object.on).forEach(([listener, handler]) => child.addEventListener(listener, handler));
  }
  return child;
};

core.renderAndAppend = (component, object) => {
  component.appendChild(core.render(object).getElement());
};
