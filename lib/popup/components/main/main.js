core.components.main = (object) => {
  const component = new Renderer('main').appendChildren(
    ...Object.values(object.content).map((child) => core.render(child)),
  );

  if (object.id) component.setAttribute('id', object.id);

  component.getElement().open = () => {
    const content = document.getElementById('content');
    content.classList.add('changing');
    component.addClass('opening').addEventListener('animationend', function handler() {
      this.removeEventListener('animationend', handler);
      content.children[0].remove();
      content.classList.remove('changing');
      this.classList.remove('opening');
    });
  };

  component.getElement().close = () => {
    const content = document.getElementById('content');
    content.scrollTo(0, 0);
    content.classList.add('changing');
    component.addClass('closing').addEventListener('animationend', () => {
      component.remove();
      content.classList.remove('changing');
    });
  };

  return component;
};
