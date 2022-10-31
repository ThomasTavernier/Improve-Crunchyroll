core.components.section = (object) => {
  const component = new Renderer('section');
  if (object.label) {
    component.setAttribute('section-label', Renderer.translate(object.label));
  }

  component.appendChildren(...Object.values(object.content).map((child) => core.render(child)));

  return component;
};
