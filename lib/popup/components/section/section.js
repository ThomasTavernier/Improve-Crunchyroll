core.components.section = (object) => {
  const component = new Renderer('section');
  if (object.label) {
    component.appendChildren(
      new Renderer('div')
        .addClass('section-label')
        .setText(Renderer.translate(object.label)),
    );
  }

  component.appendChildren(
    new Renderer('div')
      .addClass('section-content')
      .appendChildren(...Object.values(object.content).map((child) => core.render(child))),
  );

  return component;
};
