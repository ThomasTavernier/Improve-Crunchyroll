core.components.header = (object) => {
  const component = document.createElement('div');

  const left = document.createElement('div');
  const title = document.createElement('h3');
  title.innerHTML = core.translate(object.label);

  core.render(left, object.content);
  left.appendChild(title);
  component.appendChild(left);

  const right = document.createElement('div');
  component.appendChild(right);

  return component;
};
