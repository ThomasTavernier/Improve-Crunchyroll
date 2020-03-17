core.components.folder = (object) => {
  let component = document.createElement('div');
  let component_label = document.createElement('span');

  component.className = 'folder';
  component.insertAdjacentHTML('beforeend', object.icon);

  component_label.innerHTML = core.translate(object.label);
  component.appendChild(component_label);

  component.addEventListener('click', () => core.nav.goTo(object.content));

  return component;
};
