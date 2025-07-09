class MenuRenderer {
  name;
  subMenu;

  constructor(entry) {
    this.name = entry.name;
    this.subMenu = entry.subMenu;
  }

  render() {
    const actionMenuEntry = new Renderer('div');
    actionMenuEntry
      .setText(Renderer.translate(this.name))
      .addClass('ic_action_menu_parent')
      .addEventListener('click', (event) => (event.target === actionMenuEntry ? event.stopPropagation() : undefined))
      .appendChildren(this.subMenu.render());
    return actionMenuEntry;
  }
}

class ActionRenderer {
  name;
  action;

  constructor(entry) {
    this.name = entry.name;
    this.action = entry.action;
  }

  render() {
    return new Renderer('div')
      .addClass('ic_action_menu_action')
      .setText(Renderer.translate(this.name))
      .addEventListener('click', () => {
        document.documentElement.classList.add('ic_loading');
        Promise.resolve(this.action())
          .then(() => document.documentElement.classList.remove('ic_loading'))
          .catch(() => document.documentElement.classList.remove('ic_loading'));
      });
  }
}

class ActionMenuRenderer {
  entries;

  constructor(entries) {
    this.entries = entries
      .map((entry) => {
        if (entry && (typeof entry.if !== 'function' || entry.if())) {
          if (entry.type === 'menu') {
            entry.subMenu = new ActionMenuRenderer(entry.subMenus);
            if (entry.subMenu.entries.length === 1) {
              const child = entry.subMenu.entries[0];
              child.name = entry.name;
              return child;
            }
            return new MenuRenderer(entry);
          } else if (entry.type === 'action') {
            if (typeof entry.action === 'function') {
              return new ActionRenderer(entry);
            }
          }
        }
      })
      .filter((entry) => entry);
    this.length = this.entries.length;
  }

  render() {
    return new Renderer('div')
      .addClass('ic_action_menu')
      .appendChildren(...this.entries.map((entry) => entry.render()));
  }
}
