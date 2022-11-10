(() => {
  const classes = [
    [new RegExp(`^(\\/[a-z-]+)?\\/watch\\/`), Watch],
    [new RegExp(`^(\\/[a-z-]+)?\\/series\\/`), Series],
  ];
  let lastLocationPathName;
  let lastInstance = new Empty();
  const callback = () => {
    if (location.pathname === lastLocationPathName) return;
    lastLocationPathName = location.pathname;
    const clazz =
      classes.reduce((f, [regex, clazz]) => {
        return f || (regex.test(lastLocationPathName) ? clazz : f);
      }, undefined) || Empty;
    if (clazz === Empty) {
      document.documentElement.removeAttribute('ic_page');
    } else {
      document.documentElement.setAttribute('ic_page', clazz.name.toLowerCase());
    }
    chromeStorage.reload(...clazz.attributes);
    lastInstance.onDestroy();
    lastInstance = new clazz();
  };
  new MutationObserver(callback).observe(document.head.querySelector('title'), {
    childList: true,
  });
  callback();
})();
