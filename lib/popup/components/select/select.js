core.components.select = (object) => {
  const component = core.components.item(object);

  const initValue = typeof object.getInitValue === 'function' ? object.getInitValue() : chromeStorage[object.key];

  const select = new SelectRenderer().addClass('select').appendChildren(
    ...object.options.map(({ key, label, value }) => {
      const option = new InputRenderer('option').setValue(value).setText(Renderer.translate(label));
      if (value === initValue) {
        option.setAttribute('selected', 'selected');
      }
      return option;
    }),
  );
  const setSubLabel = () => object.setSubLabel(select.getOptionDOM().text);
  setSubLabel();

  return component.appendChildren(
    select.addEventListener('change', () => {
      if (object.key) {
        chromeStorage[object.key] = select.getValue();
      }
      setSubLabel();
    }),
  );
};
