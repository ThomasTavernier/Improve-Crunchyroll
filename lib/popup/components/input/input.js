core.components.input = (object) => {
  const input = new Renderer('input').addClass('input').setAttribute('type', object.inputType);
  ['value', 'required', 'min', 'max', 'step'].forEach((key) => {
    input[key] = object[key];
  });
  return core.components
    .item(object)
    .appendChildren(input)
    .addEventListener('click', () => input.focus());
};
