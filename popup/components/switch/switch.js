core.components.switch = () => {
  const component = document.createElement('div');
  component.className = 'switch';
  component.innerHTML = '<span class="slider"></span>';

  return component;
};
