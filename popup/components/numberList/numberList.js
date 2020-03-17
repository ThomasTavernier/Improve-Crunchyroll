core.components.numberList = (object) => {
    let component = core.components.item(object.key);
    let key = object.key;

    let input = document.createElement('input');
    input.type = 'text';
    input.value = chromeStorage[key];
    input.className = 'inputText';
    input.placeholder = object.placeholder;
    component.appendChild(input);

    input.addEventListener('input', () =>
        input.value = input.value.replace(/\.|,\.|,,/g, ',').replace(/^,|[^\d\,]/g, '')
    );
    input.addEventListener('change', () => {
        input.value = input.value.replace(/,$/, '');
        chromeStorage[key] = input.value;
    });
    component.addEventListener('click', () =>
        input.focus()
    );

    return component;
};