(() => {
  const pages = {
    watch: Watch,
    series: Series,
  };
  let lastLocationPathName;
  new MutationObserver(() => {
    if (location.pathname === lastLocationPathName) return;
    const { [(lastLocationPathName = location.pathname).match(/(?<=\/)[^\/]*/)[0]]: page } = pages;
    chromeStorage.reload(...(page && Array.isArray(page.attributes) ? page.attributes : []));
    if (typeof page === 'function') {
      new page();
    }
  }).observe(document.head.querySelector('title'), {
    childList: true,
  });
})();
