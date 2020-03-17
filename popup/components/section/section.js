core.components.section = (object) => {
  let component = document.createElement('section');
  component.setAttribute('section-label', core.translate(object.label));

  for (let key of Object.keys(object.content)) {
    core.render(component, object.content[key]);
  }

  return component;
};
