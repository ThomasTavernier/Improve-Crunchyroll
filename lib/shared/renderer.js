class Renderer {
  static translate(key) {
    return chrome.i18n.getMessage(key) || key;
  }

  constructor(tagName) {
    this.element = this.create(tagName);
  }

  create(tagName) {
    return document.createElement(tagName);
  }

  getElement() {
    return this.element;
  }

  addClass(...classes) {
    this.element.classList.add(...classes);
    return this;
  }

  setAttribute(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }

  removeAttribute(name) {
    this.element.removeAttribute(name);
    return this;
  }

  setStyle(key, value) {
    this.element.style[key] = value;
    return this;
  }

  setText(text) {
    this.element.textContent = text;
    return this;
  }

  appendChildren(...children) {
    children.forEach((child) => {
      if (child instanceof Renderer) {
        this.element.appendChild(child.getElement());
      } else {
        this.element.appendChild(child);
      }
    });
    return this;
  }

  addEventListener(type, listener) {
    this.element.addEventListener(type, listener);
    return this;
  }

  focus() {
    this.element.focus();
  }

  remove() {
    this.element.remove();
  }

  removeChildren() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    return this;
  }
}

class InputRenderer extends Renderer {
  getOptionsDOM() {
    return this.element.options;
  }

  getSelectedIndex() {
    return this.element.selectedIndex;
  }

  getValue() {
    return this.element.value;
  }

  setValue(value) {
    this.element.value = value;
    return this;
  }

  setDisabled(value) {
    this.element.disabled = value;
    return this;
  }
}

class SvgRenderer extends Renderer {
  create(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }
}
