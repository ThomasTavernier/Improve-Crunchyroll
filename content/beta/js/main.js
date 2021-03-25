(() => {
  const pages = {
    watch: Watch,
    series: Series,
  };
  new MutationObserver(() => {
    const { [location.pathname.match(/(?<=\/)[^\/]*/)[0]]: page } = pages;
    if (typeof page === 'function') {
      if (Array.isArray(page.attributes)) {
        chromeStorage.reload(...page.attributes);
      }
      new page();
    }
  }).observe(document.head.querySelector('title'), {
    childList: true,
  });
})();
