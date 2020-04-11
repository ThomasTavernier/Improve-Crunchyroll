core.components.numberList = (object) => {
  const component = core.components.item(object);
  const input = document.createElement('input');

  input.type = 'text';
  input.value = chromeStorage[object.key];
  input.className = 'inputText';
  input.placeholder = object.placeholder;

  input.addEventListener(
    'input',
    () => (input.value = input.value.replace(/\.|,\.|,,/g, ',').replace(/^,|[^\d\,]/g, ''))
  );
  input.addEventListener('change', () => {
    input.value = input.value.replace(/,$/, '');
    chromeStorage[object.key] = input.value;
  });
  component.addEventListener('click', () => input.focus());

  component.appendChild(input);

  return component;
};
