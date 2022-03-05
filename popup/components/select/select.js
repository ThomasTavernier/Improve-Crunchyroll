core.components.select = (object) => {
  const component = core.components.item(object);

  const initValue = chromeStorage[object.key];

  const select = document.createElement('select');
  select.className = 'select';
  object.options.forEach(({ key, label, value }) => {
    const option = document.createElement('option');
    option.value = value;
    const [upp, ...letters] = core.translate(label);
    option.innerText = [upp.toUpperCase(), ...letters].join('');
    if (value === initValue) {
      option.setAttribute('selected', 'selected');
    }
    select.appendChild(option);
  });
  const setSubLabel = () => object.setSubLabel(select.options[select.selectedIndex].text);
  select.addEventListener('change', () => {
    chromeStorage[object.key] = select.value;
    setSubLabel();
  });
  setSubLabel();
  component.appendChild(select);

  return component;
};
