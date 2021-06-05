core.components.input = (object) => {
  const component = core.components.item(object);

  const input = document.createElement('input');
  input.className = 'input';
  input.setAttribute('type', object.inputType);
  ['value', 'required', 'min'].forEach((key) => {
    input[key] = object[key];
  });
  component.appendChild(input);
  component.addEventListener('click', () => input.focus());

  return component;
};
