(() => {
  const pages = {
    watch: Watch,
    series: Series,
  };
  let lastLocationPathName;
  const callback = () => {
    if (location.pathname === lastLocationPathName) return;
    const { [(lastLocationPathName = location.pathname).match(/(?<=\/)[^\/]*/)[0]]: page } = pages;
    chromeStorage.reload(...(page && Array.isArray(page.attributes) ? page.attributes : []));
    if (typeof page === 'function') {
      new page();
    }
  };
  new MutationObserver(callback).observe(document.head.querySelector('title'), {
    childList: true,
  });
  callback();
})();
