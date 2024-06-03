class Series extends Empty {
  constructor() {
    super();
    this.markAsWatchedNotWatched = new MarkAsWatchedNotWatched();
    if (chromeStorage.anilist_link.includes('series') || chromeStorage.myanimelist_link.includes('series')) {
      this.animeListLinks = new SeriesAnimeListLinks();
    }

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.anilist_link || changes.myanimelist_link) {
        this.animeListLinks?.destroy();
        this.animeListLinks = new SeriesAnimeListLinks();
      }
    });
  }

  onDestroy() {
    super.onDestroy();
    this.markAsWatchedNotWatched.destroy();
    this.animeListLinks?.destroy();
  }
}

class MarkAsWatchedNotWatched {
  static REFRESH_TIMEOUT = 2500;

  episodes = new Proxy(
    {},
    {
      get(target, p) {
        if (!(p in target)) {
          target[p] = API.episodes(p);
        }
        return Reflect.get(target, p);
      },
    },
  );
  series_id;
  refreshTimeout;

  constructor() {
    this.refresh = this.refresh.bind(this);
    [this.series_id] = location.pathname.match(/(?<=\/series\/)[^\/]*/) || [];
    if (!this.series_id) return;
    const appBodyWrapper = document.querySelector('.app-body-wrapper');
    if (!appBodyWrapper) return;
    const ercSeasonWithNavigation = appBodyWrapper.querySelector('.erc-season-with-navigation');
    if (ercSeasonWithNavigation) {
      this.createAndWatch(ercSeasonWithNavigation);
    } else {
      new MutationObserver((_, observer) => {
        const ercSeasonWithNavigation = appBodyWrapper.querySelector('.erc-season-with-navigation');
        if (!ercSeasonWithNavigation) return;
        observer.disconnect();
        this.createAndWatch(ercSeasonWithNavigation);
      }).observe(appBodyWrapper, {
        childList: true,
        subtree: true,
      });
    }
  }

  get seasons() {
    Object.defineProperty(this, 'seasons', {
      value: API.seasons(this.series_id),
    });
    return this.seasons;
  }

  get upNextSeries() {
    Object.defineProperty(this, 'upNextSeries', {
      value: API.up_next_series(this.series_id),
    });
    return this.upNextSeries;
  }

  destroy() {
    clearInterval(this.refreshTimeout);
  }

  createAndWatch(ercSeasonWithNavigation) {
    this.getCurrentSeasonEpisodes().then((episodes) => {
      ercSeasonWithNavigation.querySelectorAll('.card').forEach((card) => {
        this.card(card, episodes);
      });
      this.watchCollection(ercSeasonWithNavigation);
    });
    this.watchSeason(ercSeasonWithNavigation);
  }

  watchSeason(ercSeasonWithNavigation) {
    new MutationObserver((mutations) => {
      const ercSeasonEpisodeList = mutations.reduce(
        (f, { addedNodes }) =>
          f || [...addedNodes].find(({ classList }) => classList.contains('erc-season-episode-list')),
        false,
      );
      if (!ercSeasonEpisodeList) return;
      this.getCurrentSeasonEpisodes().then((episodes) => {
        ercSeasonEpisodeList.querySelectorAll('.card').forEach((card) => {
          this.card(card, episodes);
        });
        this.watchCollection(ercSeasonWithNavigation);
      });
    }).observe(ercSeasonWithNavigation, {
      childList: true,
    });
  }

  watchCollection(ercSeasonWithNavigation) {
    const ercPlayableCollection = ercSeasonWithNavigation.querySelector('.erc-playable-collection');
    if (!ercPlayableCollection) return;
    new MutationObserver((mutations) => {
      const cards = [...mutations]
        .flatMap(({ addedNodes }) => [...addedNodes])
        .filter(({ classList }) => classList.contains('card'));
      if (cards.length > 0) {
        this.getCurrentSeasonEpisodes().then((episodes) => {
          cards.forEach((card) => this.card(card, episodes));
        });
      }
    }).observe(ercPlayableCollection, {
      childList: true,
    });
  }

  getCurrentSeasonEpisodes() {
    const currentSeasonH4 = document.querySelector('div.seasons-select h4');
    return currentSeasonH4
      ? this.seasons.then(
          (seasons) => this.episodes[seasons.find(({ title }) => currentSeasonH4.innerText.endsWith(title)).id],
        )
      : this.upNextSeries.then(({ season_id }) => {
          return this.episodes[season_id];
        });
  }

  card(card, episodes) {
    new MutationObserver((mutations) => {
      if (
        mutations
          .flatMap((mutation) => [...mutation.addedNodes])
          .some((node) => [...node.classList].find((c) => c.startsWith('playable-card')))
      ) {
        this.getCurrentSeasonEpisodes().then((episodes) => {
          this.createCard(card, episodes);
        });
      }
    }).observe(card, {
      childList: true,
    });
    this.createCard(card, episodes);
  }

  createCard(card, episodes) {
    const body = card.querySelector(`[class^='playable-card-hover__body']`);
    if (!body || body.querySelector('.ic_action')) return;
    const a = card.querySelector('a');
    if (!a) return;
    const episode = episodes.find(({ id }) => {
      return a.href.includes(id);
    });
    if (!episode) return;
    const release = card.querySelector(`[class^='playable-card-hover__release']`);
    if (release) {
      release.appendChild(createActionMenuButton(this.createMarkAsWatchedNotWatchedEntries(episode, episodes)));
      release.querySelector('span').textContent += ` - ${new Date(episode.availability_starts).toLocaleTimeString()}`;
    }
  }

  createMarkAsWatchedNotWatchedEntries(episode, episodes) {
    const { id, sequence_number: episode_sequence_number, duration_ms } = episode;
    const {
      0: { sequence_number: first_episode_sequence_number },
      length,
      [length - 1]: { sequence_number: last_episode_sequence_number },
    } = episodes;
    return [
      {
        name: 'markAsWatched',
        type: 'menu',
        subMenus: [
          {
            name: 'markOnlyThisOne',
            type: 'action',
            action: () => API.playheads({ id, playheadMs: duration_ms }).then(this.refresh),
          },
          {
            name: 'markAllPrevious',
            if: () => episode_sequence_number > first_episode_sequence_number,
            type: 'action',
            action: () =>
              API.playheads(
                ...episodes
                  .filter(({ sequence_number }) => sequence_number <= episode_sequence_number)
                  .map(({ id, duration_ms }) => ({ id, playheadMs: duration_ms })),
              ).then(this.refresh),
          },
        ],
      },
      {
        name: 'markAsNotWatched',
        type: 'menu',
        subMenus: [
          {
            name: 'markOnlyThisOne',
            type: 'action',
            action: () => API.playheads({ id, playheadMs:0 }).then(this.refresh),
          },
          {
            name: 'markAllNext',
            if: () => last_episode_sequence_number !== episode_sequence_number,
            type: 'action',
            action: () =>
              API.playheads(
                ...episodes
                  .filter(({ sequence_number }) => sequence_number >= episode_sequence_number)
                  .map(({ id }) => ({ id, playheadMs:0 })),
              ).then(this.refresh),
          },
        ],
      },
    ];
  }

  refresh() {
    clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => {
      const searchA = document.querySelector('a[href$="/search"]');
      if (searchA) {
        searchA.click();
        history.back();
      } else {
        location.reload();
      }
    }, MarkAsWatchedNotWatched.REFRESH_TIMEOUT);
  }
}

class SeriesAnimeListLinks {
  container;

  seasonsSelect;
  seasonNameContainer;

  constructor() {
    this.seasonsSelect = document.querySelector('.seasons-select');
    if (this.seasonsSelect) {
      this.seasonNameContainer = this.seasonsSelect.querySelector('h4');
      if (this.seasonNameContainer) {
        this.createButtons()
      } else {
        new MutationObserver((_, observer) => {
          this.seasonNameContainer = this.seasonsSelect.querySelector('h4');
          if (!this.seasonNameContainer) return;
          observer.disconnect();
          this.createButtons();
        }).observe(document.getElementById('content'), {
          childList: true,
          subtree: true,
        })
      }
    } else {
      new MutationObserver((_, observer) => {
        this.seasonsSelect = document.querySelector('.seasons-select');
        if (!this.seasonsSelect) return;
        observer.disconnect();
        new MutationObserver((_, observer) => {
          this.seasonNameContainer = this.seasonsSelect.querySelector('h4');
          if (!this.seasonNameContainer) return;
          observer.disconnect();
          this.createButtons();
        }).observe(document.getElementById('content'), {
          childList: true,
          subtree: true,
        })
      }).observe(document.getElementById('content'), {
        childList: true,
        subtree: true,
      })
    }
  }

  createButtons() {
    const seasonTitle = this.seasonNameContainer.textContent;
    animeListButtons(seasonTitle, ([anilistButton, malButton]) => {
      this.container = new Renderer('div')
        .setAttribute('style', 'margin-left: .75rem')
        .addClass('anime-list-link-container');
      if (chromeStorage.anilist_link.includes('series') && anilistButton) {
        this.container.appendChildren(anilistButton);
      }
      if (chromeStorage.myanimelist_link.includes('series') && malButton) {
        this.container.appendChildren(malButton);
      }
      this.seasonsSelect.append(this.container.getElement());
    })
  }

  destroy() {
    this.container?.remove();
  }
}
