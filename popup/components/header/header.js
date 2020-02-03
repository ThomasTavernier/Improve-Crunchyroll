core.components.header = (object) => {
    let component = document.createElement('div');

    let left = document.createElement('div');
    let title = document.createElement('h3');
    title.innerHTML = core.translate(object.label);

    core.render(left, object.content);
    left.appendChild(title);
    component.appendChild(left);

    let right = document.createElement('div');
    component.appendChild(right);

    return component;
};