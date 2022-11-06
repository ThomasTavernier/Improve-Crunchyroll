core.components.switch = () => {
  return new Renderer('div').addClass('switch').appendChildren(new Renderer('span').addClass('slider'));
};
