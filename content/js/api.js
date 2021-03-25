(() => {
  chrome.runtime.onMessage.addListener(function ({ type, data }, sender, sendResponse) {
    const { [type]: action } = actions;
    if (typeof action === 'function') {
      action(...arguments);
      return true;
    }
    sendResponse();
  });
  const actions = {
    skippers({ data: { legacyMediaId } }, sender, sendResponse) {
      new Promise((resolve) => {
        fetch(
          `https://www.crunchyroll.com/showmedia?id=${document
            .querySelector(`[media_id="${legacyMediaId}"]`)
            .previousElementSibling.getAttribute('media_id')}`
        )
          .then((response) => response.text())
          .then((text) => {
            resolve([...JSON.parse(text.match(/(?<=vilos\.config\.media = ){.*}/)[0]).subtitles]);
          });
      })
        .then(sendResponse)
        .catch(() => sendResponse([]));
    },
  };
})();
