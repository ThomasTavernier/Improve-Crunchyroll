core.components.numberList = (object) => {
  const input = new InputRenderer('input')
    .setAttribute('type', 'text')
    .setValue(chromeStorage[object.key])
    .addClass('input')
    .setAttribute('placeholder', object.placeholder)
    .addEventListener('input', () =>
      input.setValue(
        input
          .getValue()
          .replace(/\.|,\.|,,/g, ',')
          .replace(/^,|[^\d,]/g, ''),
      ),
    )
    .addEventListener('change', () => {
      input.setValue(input.getValue().replace(/,$/, ''));
      chromeStorage[object.key] = input.getValue();
    });
  return core.components
    .item(object)
    .addEventListener('click', () => input.focus())
    .appendChildren(input);
};
