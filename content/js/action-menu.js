function createActionMenuButton(entries) {
  const createActionMenuEntries = (entries) => {
    const actionMenu = document.createElement('div');
    actionMenu.classList.add('ic_action_menu');
    entries.forEach((entry) => {
      const actionMenuEntry = document.createElement('div');
      const name = chrome.i18n.getMessage(entry.name);
      actionMenuEntry.innerHTML = name !== '' ? name : entry.name;
      if (entry.action && typeof entry.action === 'function')
        actionMenuEntry.addEventListener('click', () => {
          document.documentElement.classList.add('ic_loading');
          Promise.resolve(entry.action())
            .then(() => document.documentElement.classList.remove('ic_loading'))
            .catch(() => document.documentElement.classList.remove('ic_loading'));
        });
      if (entry.subMenus) {
        actionMenuEntry.classList.add('ic_action_menu_parent');
        actionMenuEntry.addEventListener('click', (event) =>
          event.target === actionMenuEntry ? event.stopPropagation() : undefined,
        );
        actionMenuEntry.appendChild(createActionMenuEntries(entry.subMenus));
      }
      actionMenu.appendChild(actionMenuEntry);
    });
    return actionMenu;
  };

  const parseEntries = (...entries) =>
    entries
      .map((entry) => {
        if (!entry.if || typeof entry.if !== 'function' || entry.if()) {
          entry.subMenus = entry.subMenus ? parseEntries(...entry.subMenus) : undefined;
          if (
            (entry.action && typeof entry.action === 'function') ||
            (Array.isArray(entry.subMenus) && entry.subMenus.length > 1)
          ) {
            return entry;
          } else if (Array.isArray(entry.subMenus) && entry.subMenus[0]) {
            entry.action = entry.subMenus[0].action;
            entry.subMenus = entry.subMenus[0].subMenus;
            return parseEntries(entry)[0];
          }
        }
      })
      .filter((entry) => entry);

  entries = parseEntries(...entries);
  if (entries.length === 0) {
    return;
  }
  const actionMenuButton = document.createElement('div');
  actionMenuButton.classList.add('ic_action');
  actionMenuButton.innerHTML =
    '<svg viewBox="0 0 226 226"><path d="M113,30.13333c-12.48164,0 -22.6,10.11836 -22.6,22.6c0,12.48164 10.11836,22.6 22.6,22.6c12.48164,0 22.6,-10.11836 22.6,-22.6c0,-12.48164 -10.11836,-22.6 -22.6,-22.6zM113,90.4c-12.48164,0 -22.6,10.11836 -22.6,22.6c0,12.48164 10.11836,22.6 22.6,22.6c12.48164,0 22.6,-10.11836 22.6,-22.6c0,-12.48164 -10.11836,-22.6 -22.6,-22.6zM113,150.66667c-12.48164,0 -22.6,10.11836 -22.6,22.6c0,12.48164 10.11836,22.6 22.6,22.6c12.48164,0 22.6,-10.11836 22.6,-22.6c0,-12.48164 -10.11836,-22.6 -22.6,-22.6z"></path></svg>';
  actionMenuButton.addEventListener('click', (event) => {
    event.preventDefault();
    actionMenuButton.setAttribute('menu-active', '');
    const actionMenu = createActionMenuEntries(entries);
    const maxWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth,
    );
    let left = window.pageXOffset + event.clientX;
    const deltaWidth = maxWidth - left;
    if (deltaWidth <= 300) {
      actionMenu.classList.add('left');
      if (deltaWidth <= 150) {
        left -= 150;
      }
    }
    actionMenu.style.left = `${left}px`;
    actionMenu.style.top = `${window.pageYOffset + event.clientY}px`;
    setTimeout(() => {
      document.documentElement.addEventListener('click', function eventListener() {
        document.documentElement.removeEventListener('click', eventListener);
        actionMenuButton.removeAttribute('menu-active');
        actionMenu.remove();
      });
    });
    document.documentElement.appendChild(actionMenu);
  });
  return actionMenuButton;
}
