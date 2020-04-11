core.components.section = (object) => {
  const component = document.createElement('section');
  if (object.label) {
    component.setAttribute('section-label', core.translate(object.label));
  }

  Object.keys(object.content).forEach((key) => {
    core.render(component, object.content[key]);
  });

  return component;
};
