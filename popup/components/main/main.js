core.components.main = (object) => {
  const component = document.createElement('main');
  if (object.id) component.id = object.id;

  Object.keys(object.content).forEach((key) => {
    core.render(component, object.content[key]);
  });

  component.open = () => {
    const content = document.getElementById('content');
    content.classList.add('changing');
    component.classList.add('opening');
    component.addEventListener('animationend', function handler() {
      this.removeEventListener('animationend', handler);
      content.children[0].remove();
      content.classList.remove('changing');
      this.classList.remove('opening');
    });
  };

  component.close = () => {
    const content = document.getElementById('content');
    content.classList.add('changing');
    component.classList.add('closing');
    component.addEventListener('animationend', () => {
      component.remove();
      content.classList.remove('changing');
    });
  };

  return component;
};
