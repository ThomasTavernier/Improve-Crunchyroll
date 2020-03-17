core.components.main = (object) => {
  let component = document.createElement('main');
  if (object.id) component.id = object.id;

  for (let key of Object.keys(object.content)) {
    core.render(component, object.content[key]);
  }

  component.open = () => {
    let content = document.getElementById('content');
    content.classList.add('changing');
    component.classList.add('opening');
    component.addEventListener('animationend', function handler() {
      this.removeEventListener('animationend', handler);
      content.children[0].remove();
      content.classList.remove('changing');
      component.classList.remove('opening');
    });
  };

  component.close = () => {
    let content = document.getElementById('content');
    content.classList.add('changing');
    component.classList.add('closing');
    component.addEventListener('animationend', () => {
      component.remove();
      content.classList.remove('changing');
    });
  };

  return component;
};
