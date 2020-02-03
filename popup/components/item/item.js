core.components.item = (label) => {
    let component = document.createElement('div');
    let component_label = document.createElement('span');

    component.className = 'item';

    component_label.innerHTML = core.translate(label);
    component.appendChild(component_label);

    return component;
};