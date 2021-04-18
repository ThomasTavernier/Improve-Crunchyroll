(() => {
  const pages = {
    watch: Watch,
    series: Series,
  };
  new MutationObserver(() => {
    const { [location.pathname.match(/(?<=\/)[^\/]*/)[0]]: page } = pages;
    if (page && Array.isArray(page.attributes)) {
      chromeStorage.reload(...page.attributes);
    } else {
      chromeStorage.reload();
    }
    if (typeof page === 'function') {
      new page();
    }
  }).observe(document.head.querySelector('title'), {
    childList: true,
  });
})();
