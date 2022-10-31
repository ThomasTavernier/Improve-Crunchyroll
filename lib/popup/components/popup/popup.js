core.components.popup = (object) => {
  const component = new Renderer('div').addClass('popup_container').addEventListener('click', () => component.remove());

  component.getElement().close = () => component.remove();

  return component.appendChildren(
    core.components
      .section(object)
      .addClass('popup')
      .addEventListener('click', (event) => event.stopPropagation()),
  );
};
