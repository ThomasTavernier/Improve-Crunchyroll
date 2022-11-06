core.components.select = (object) => {
  const component = core.components.item(object);

  const initValue = chromeStorage[object.key];

  const select = new InputRenderer('select').addClass('select').appendChildren(
    ...object.options.map(({ key, label, value }) => {
      const option = new InputRenderer('option').setValue(value).setText(Renderer.translate(label));
      if (value === initValue) {
        option.setAttribute('selected', 'selected');
      }
      return option;
    }),
  );
  const setSubLabel = () => object.setSubLabel(select.getOptionsDOM()[select.getSelectedIndex()].text);
  setSubLabel();

  return component.appendChildren(
    select.addEventListener('change', () => {
      chromeStorage[object.key] = select.getValue();
      setSubLabel();
    }),
  );
};
