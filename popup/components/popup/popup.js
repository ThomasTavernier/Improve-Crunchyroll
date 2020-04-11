core.components.popup = (object) => {
  const component = document.createElement('div');
  const popup = core.components.section(object);

  component.classList.add('popup_container');
  popup.classList.add('popup');

  component.close = () => component.remove();

  component.addEventListener('click', () => component.close());
  popup.addEventListener('click', (event) => event.stopPropagation());

  component.appendChild(popup);

  return component;
};
