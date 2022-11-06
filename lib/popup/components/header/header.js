core.components.header = (object) =>
  new Renderer('div').appendChildren(
    new Renderer('div').appendChildren(
      core.render(object.content),
      new Renderer('h3').setText(Renderer.translate(object.label)),
    ),
  );
