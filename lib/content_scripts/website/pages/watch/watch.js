class Watch extends Empty {
  static attributes = ['header_on_hover', 'player_mode', 'scrollbar'];

  constructor() {
    super();

    this.onStorageChange(chromeStorage);
    chrome.storage.onChanged.addListener(this.onStorageChange);
    chrome.runtime.onMessage.addListener(({type, data}) => {
      if (type === "shortcut") {
        switch (data) {
          case "nextEpisode":
            document.querySelector('[data-t=next-episode] a').click();
            break;
          case "previousEpisode":
            document.querySelector('[data-t=prev-episode] a').click();
            break;
        }
      }
    });
  }

  onStorageChange(changes) {
    if (changes.anilist_link !== undefined || changes.myanimelist_link !== undefined) {
      this.animeListLinks?.destroy();
      if (changes.anilist_link?.includes('watch') || changes.myanimelist_link?.includes('watch')) {
        this.animeListLinks = new WatchAnimeListLinks();
      }
    }
    if (changes.hide_last_episode_banner !== undefined) {
      this.lastEpisodeBanner?.destroy();
      if (changes.hide_last_episode_banner) {
        this.lastEpisodeBanner = new WatchLastEpisodeBanner();
      }
    }
  }

  onDestroy() {
    super.onDestroy();
    this.lastEpisodeBanner?.destroy();
    this.animeListLinks?.destroy();
  }
}

class WatchLastEpisodeBanner {
  watchEpisodeContainer;
  observer;

  constructor() {
    this.watchEpisodeContainer = document.querySelector('.erc-watch-episode');
    if (this.watchEpisodeContainer) {
      this.createBannerObserver();
    } else {
      new MutationObserver((_, observer) => {
        this.watchEpisodeContainer = document.querySelector('.erc-watch-episode');
        if (!this.watchEpisodeContainer) return
        observer.disconnect();
        this.createBannerObserver();
      }).observe(document.getElementById('content'), {
        childList: true,
        subtree: true,
      });
    }
  }

  createBannerObserver() {
    this.observer = new MutationObserver(() => {
      const banner = this.watchEpisodeContainer.querySelector('.erc-end-slate-recommendations-carousel');
      if (banner) {
        banner.querySelector('button[data-t="close-btn"]').click();
      }
    });
    this.observer.observe(this.watchEpisodeContainer, {
      childList: true,
    })
  }

  destroy() {
    this.observer?.disconnect();
  }
}

class WatchAnimeListLinks {
  currentMediaHeader;
  container;

  constructor() {
    this.currentMediaHeader = document.querySelector('.current-media-header');
    if (this.currentMediaHeader) {
      this.createButtons();
    } else {
      new MutationObserver((_, observer) => {
        this.currentMediaHeader = document.querySelector('.current-media-header');
        if (!this.currentMediaHeader) return;
        observer.disconnect();
        this.createButtons();
      }).observe(document.getElementById('content'), {
        childList: true,
        subtree: true,
      });
    }
  }

  createButtons() {
    const seasonTitle = this.currentMediaHeader.querySelector('h4').textContent;
    animeListButtons(seasonTitle, ([anilistButton, malButton]) => {
      this.container = new Renderer('div')
        .addClass('anime-list-link-container');
      if (chromeStorage.anilist_link.includes('watch') && anilistButton) {
        this.container.appendChildren(anilistButton);
      }
      if (chromeStorage.myanimelist_link.includes('watch') && malButton) {
        this.container.appendChildren(malButton);
      }
      this.container.appendChildren(this.currentMediaHeader.lastElementChild);
      this.currentMediaHeader.append(this.container.getElement());
    });
  }

  destroy() {
    if (this.container) {
      this.currentMediaHeader.append(this.container.getElement().lastElementChild);
      this.container.remove();
    }
  }
}
