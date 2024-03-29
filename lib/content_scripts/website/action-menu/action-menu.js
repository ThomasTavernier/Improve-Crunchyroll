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

function createActionMenuButton(entries) {
  const actionMenuRenderer = new ActionMenuRenderer(entries);
  if (actionMenuRenderer.length === 0) {
    return;
  }
  const actionMenuButton = new Renderer('div')
    .addClass('ic_action')
    .appendChildren(
      new SvgRenderer('svg')
        .setAttribute('viewBox', '0 0 226 226')
        .appendChildren(
          new SvgRenderer('path').setAttribute(
            'd',
            'M113,30.13333c-12.48164,0 -22.6,10.11836 -22.6,22.6c0,12.48164 10.11836,22.6 22.6,22.6c12.48164,0 22.6,-10.11836 22.6,-22.6c0,-12.48164 -10.11836,-22.6 -22.6,-22.6zM113,90.4c-12.48164,0 -22.6,10.11836 -22.6,22.6c0,12.48164 10.11836,22.6 22.6,22.6c12.48164,0 22.6,-10.11836 22.6,-22.6c0,-12.48164 -10.11836,-22.6 -22.6,-22.6zM113,150.66667c-12.48164,0 -22.6,10.11836 -22.6,22.6c0,12.48164 10.11836,22.6 22.6,22.6c12.48164,0 22.6,-10.11836 22.6,-22.6c0,-12.48164 -10.11836,-22.6 -22.6,-22.6z',
          ),
        ),
    )
    .addEventListener('click', (event) => {
      event.preventDefault();
      const actionMenu = actionMenuRenderer.render();
      const maxWidth = Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth,
      );
      let left = window.scrollX + event.clientX;
      const deltaWidth = maxWidth - left;
      if (deltaWidth <= 300) {
        actionMenu.addClass('left');
        if (deltaWidth <= 150) {
          left -= 150;
        }
      }
      actionMenu.setStyle('left', `${left}px`);
      actionMenu.setStyle('top', `${window.scrollY + event.clientY}px`);
      setTimeout(() => {
        document.documentElement.addEventListener('click', function eventListener() {
          document.documentElement.removeEventListener('click', eventListener);
          actionMenu.remove();
        });
      });
      document.documentElement.appendChild(actionMenu.getElement());
    });
  return actionMenuButton.getElement();
}
