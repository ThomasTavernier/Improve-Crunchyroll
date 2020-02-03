core.components.button = (object) => {
    let component = document.createElement('button');
    component.innerHTML = object.innerHTML;

    return component;
};