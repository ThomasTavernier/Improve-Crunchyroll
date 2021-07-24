(() => {
  const classes = new Proxy({
    watch: Watch,
    series: Series,
  }, {
    get(target, p, receiver) {
      return Reflect.get(target, p, receiver) || Empty;
    },
  });
  let lastLocationPathName;
  let lastInstance = new Empty();
  const callback = () => {
    if (location.pathname === lastLocationPathName) return;
    const { [(lastLocationPathName = location.pathname).match(/(?<=\/)[^\/]*/)[0]]: clazz } = classes;
    chromeStorage.reload(...clazz.attributes);
    lastInstance.onDestroy();
    lastInstance = new clazz();
  };
  new MutationObserver(callback).observe(document.head.querySelector('title'), {
    childList: true,
  });
  callback();
})();
