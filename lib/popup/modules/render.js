core.render = (component, object) => {
  const child = core.components[object.type](object);

  if (object.class) {
    object.class.forEach((className) => child.classList.add(className));
  }
  if (object.hide) {
    child.style.display = 'none';
  }
  if (object.on) {
    Object.entries(object.on).forEach(([listener, handler]) => child.addEventListener(listener, handler));
  }

  component.appendChild(child);
};
