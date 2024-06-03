class Watch extends Empty {
  static attributes = ['header_on_hover', 'player_mode', 'scrollbar'];

  constructor() {
    super();
    if (chromeStorage.anilist_link.includes('watch') || chromeStorage.myanimelist_link.includes('watch')) {
      this.animeListLinks = new WatchAnimeListLinks();
    }

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.anilist_link || changes.myanimelist_link) {
        this.animeListLinks?.destroy();
        this.animeListLinks = new WatchAnimeListLinks();
      }
    });
  }

  onDestroy() {
    super.onDestroy();
    this.animeListLinks?.destroy();
  }
}

class WatchAnimeListLinks {
  currentMediaHeader;
  container;

  constructor() {
    this.currentMediaHeader = document.querySelector('.current-media-header');
    if (this.currentMediaHeader) {
      this.createButtons()
    } else {
      new MutationObserver((_, observer) => {
        this.currentMediaHeader = document.querySelector('.current-media-header');
        if (!this.currentMediaHeader) return;
        observer.disconnect();
        this.createButtons();
      }).observe(document.getElementById('content'), {
        childList: true,
        subtree: true,
      })
    }
  }

  createButtons() {
    const seasonTitle = this.currentMediaHeader.querySelector('h4').textContent;
    animeListButtons(seasonTitle, ([anilistButton, malButton]) => {
      this.container = new Renderer('div')
        .addClass('anime-list-link-container');
      if (chromeStorage.anilist_link.includes('watch') && anilistButton) {
        this.container.appendChildren(anilistButton)
      }
      if (chromeStorage.myanimelist_link.includes('watch') && malButton) {
        this.container.appendChildren(malButton)
      }
      this.container.appendChildren(this.currentMediaHeader.lastElementChild);
      this.currentMediaHeader.append(this.container.getElement());
    })
  }

  destroy() {
    if (this.container) {
      this.currentMediaHeader.append(this.container.getElement().lastElementChild);
      this.container.remove();
    }
  }
}
