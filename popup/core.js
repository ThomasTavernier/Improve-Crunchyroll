const core = new (class {
  main = {};
  components = {};

  translate(text) {
    return chrome.i18n.getMessage(text) || text;
  }
})();
