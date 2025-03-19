let locale;
(() => {
  const classes = [
    [new RegExp(`^(\\/[a-z-]+)?\\/watch\\/`), Watch],
    [new RegExp(`^(\\/[a-z-]+)?\\/series\\/`), Series],
  ];
  const locales = {
    ar: 'ar-SA',
    de: 'de-DE',
    es: 'es-419',
    'es-es': 'es-ES',
    fr: 'fr-FR',
    it: 'it-IT',
    'pt-br': 'pt-BR',
    'pt-pt': 'pt-PT',
    ru: 'ru-RU',
    hi: 'hi-IN',
  };
  let lastLocationPathName;
  let lastInstance = new Empty();
  const callback = () => {
    if (location.pathname === lastLocationPathName) return;
    lastLocationPathName = location.pathname;
    const clazz =
      classes.reduce((f, [regex, clazz]) => {
        return f || (regex.test(lastLocationPathName) ? clazz : f);
      }, undefined) || Empty;
    locale = locales[location.pathname.split`/`[1]] ?? 'en-US';
    if (clazz === Empty) {
      document.documentElement.removeAttribute('ic_page');
    } else {
      document.documentElement.setAttribute('ic_page', clazz.name.toLowerCase());
    }
    chromeStorage.reload('open_header_menu_on_hover', ...clazz.attributes);
    lastInstance.onDestroy();
    lastInstance = new clazz();
  };

  let title = document.title;
  new MutationObserver(() => {
    if (document.title === title) return;
    title = document.title;
    callback();
  }).observe(document.head, {
    childList: true,
  });
})();
