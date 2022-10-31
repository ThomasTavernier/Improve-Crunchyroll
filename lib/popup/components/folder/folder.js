core.components.folder = (object) => {
  return new Renderer('div')
    .addClass('folder')
    .appendChildren(object.icon, new Renderer('span').setText(Renderer.translate(object.label)))
    .addEventListener('click', () => core.nav.goTo(object.content));
};
