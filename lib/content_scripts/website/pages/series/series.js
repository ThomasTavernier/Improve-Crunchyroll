class Series extends Empty {
  constructor() {
    super();
    const [seriesId] = location.pathname.match(/(?<=\/series\/)[^\/]*/) || [];
    if (!seriesId) return;
    const seasons = API.seasons(seriesId);
    const episodes = this.#getEpisodesProxy();
    this.markAsWatchedNotWatched = new MarkAsWatchedNotWatched(seriesId, seasons, episodes);
    chromeStorage.LOADED.then(() => {
      if (chromeStorage.anilist_link.includes('series') || chromeStorage.myanimelist_link.includes('series')) {
        this.animeListLinks = new SeriesAnimeListLinks();
      }
      if (chromeStorage.episode_air_date_series) {
        this.episodeAirDate = new EpisodeAirDate(seriesId, seasons, episodes);
      }
    });
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.anilist_link || changes.myanimelist_link) {
        this.animeListLinks?.destroy();
        this.animeListLinks = new SeriesAnimeListLinks();
      }
      if (changes.episode_air_date_series !== undefined) {
        this.episodeAirDate?.destroy();
        if (changes.episode_air_date_series.newValue) {
          this.episodeAirDate = new EpisodeAirDate(seriesId, seasons, episodes);
        }
      }
    });
  }

  #getEpisodesProxy() {
    return new Proxy(
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
  }

  onDestroy() {
    super.onDestroy();
    this.markAsWatchedNotWatched?.destroy();
    this.animeListLinks?.destroy();
    this.episodeAirDate?.destroy();
  }
}

class MarkAsWatchedNotWatched {
  static REFRESH_TIMEOUT = 2500;

  seriesId;
  refreshTimeout;

  constructor(seriesId, seasons, episodes) {
    this.refresh = this.refresh.bind(this);
    this.seriesId = seriesId;
    this.seasons = seasons;
    this.episodes = episodes;

    const appBodyWrapper = document.querySelector('.erc-root-layout');
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

  get upNextSeries() {
    Object.defineProperty(this, 'upNextSeries', {
      value: API.up_next_series(this.seriesId),
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
    const currentSeasonTitle = document.querySelector('.seasons-select h4, .seasons-select span[class^=select-trigger__title]');
    return currentSeasonTitle
      ? this.seasons.then((seasons) => {
        let found = seasons.find(({ title }) => currentSeasonTitle.innerText.endsWith(title));
        if (found) {
          return this.episodes[found.id];
        }
        return [];
      })
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
    const body = card.querySelector(`[class^='playable-card__body']`);
    if (!body || body.querySelector('.ic_action')) return;
    const a = card.querySelector('a');
    if (!a) return;
    const episode = episodes.find(({ id, versions }) => {
      return a.href.includes(id) || versions.some(({ guid }) => a.href.includes(guid));
    });
    if (!episode) return;

    const release = card.querySelector(`[class^='playable-card-hover__release']`);
    const footer = card.querySelector('[class^="playable-card__footer"]');

    if (release) {
      release.querySelector('span').textContent += ` - ${new Date(episode.availability_starts).toLocaleTimeString()}`;
    }

    const actionMenuRenderer = new ActionMenuRenderer(this.createMarkAsWatchedNotWatchedEntries(episode, episodes));
    if (actionMenuRenderer.length === 0) {
      return;
    }
    const actionMenu = actionMenuRenderer.render();

    // activate css rule to hide the default action menu
    footer.classList.add('ic_action');

    const optionsButton = footer.querySelector('[class^="dropdown-trigger"]');
    // hijack existing options button (3 dots) click event. by using this hijack the hover state of the card remains
    // until the action menu is closed
    optionsButton.addEventListener('click', () => setTimeout(() => {
      actionMenu.setStyle('margin-top', '24px');
      actionMenu.setStyle('right', '0');
      if (window.innerWidth - optionsButton.getBoundingClientRect().right < 300) {
        actionMenu.addClass('left');
      }
      optionsButton.parentElement.appendChild(actionMenu.getElement());

      document.documentElement.addEventListener('click', function eventListener() {
        document.documentElement.removeEventListener('click', eventListener);
        actionMenu.remove();
      });
    }))
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
            action: () => API.playheads({ id, playheadMs: 0 }).then(this.refresh),
          },
          {
            name: 'markAllNext',
            if: () => last_episode_sequence_number !== episode_sequence_number,
            type: 'action',
            action: () =>
              API.playheads(
                ...episodes
                  .filter(({ sequence_number }) => sequence_number >= episode_sequence_number)
                  .map(({ id }) => ({ id, playheadMs: 0 })),
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
      this.seasonNameContainer = this.seasonsSelect.querySelector('h4, span[class^=select-trigger__title]');
      if (this.seasonNameContainer) {
        this.createButtons();
      } else {
        new MutationObserver((_, observer) => {
          this.seasonNameContainer = this.seasonsSelect.querySelector('h4, span[class^=select-trigger__title]');
          if (!this.seasonNameContainer) return;
          observer.disconnect();
          this.createButtons();
        }).observe(document.getElementById('content'), {
          childList: true,
          subtree: true,
        });
      }
    } else {
      new MutationObserver((_, observer) => {
        this.seasonsSelect = document.querySelector('.seasons-select');
        if (!this.seasonsSelect) return;
        observer.disconnect();
        new MutationObserver((_, observer) => {
          this.seasonNameContainer = this.seasonsSelect.querySelector('h4, span[class^=select-trigger__title]');
          if (!this.seasonNameContainer) return;
          observer.disconnect();
          this.createButtons();
        }).observe(document.getElementById('content'), {
          childList: true,
          subtree: true,
        });
      }).observe(document.getElementById('content'), {
        childList: true,
        subtree: true,
      });
    }
  }

  createButtons() {
    const seasonTitle = this.seasonNameContainer.textContent;
    animeListButtons(seasonTitle, ([anilistButton, malButton]) => {
      this.container = new Renderer('div')
        .addClass('anime-list-link-container');
      if (chromeStorage.anilist_link.includes('series') && anilistButton) {
        this.container.appendChildren(anilistButton);
      }
      if (chromeStorage.myanimelist_link.includes('series') && malButton) {
        this.container.appendChildren(malButton);
      }
      this.seasonsSelect.append(this.container.getElement());
    });
  }

  destroy() {
    this.container?.remove();
  }
}

class EpisodeAirDate {
  container;
  actionButtons;

  seriesId;

  constructor(seriesId, seasons, episodes) {
    this.seriesId = seriesId;
    this.seasons = seasons;
    this.episodes = episodes;

    this.actionButtons = document.querySelector('.erc-series-hero-actions');
    if (!this.actionButtons) {
      new MutationObserver((_, observer) => {
        this.actionButtons = document.querySelector('.erc-series-hero-actions');
        if (!this.actionButtons) return;
        observer.disconnect();
        this.createElement();
      }).observe(document.getElementById('content'), {
        childList: true,
        subtree: true,
      });
    } else {
      this.createElement();
    }
  }

  createElement() {
    this.getAirDate((date) => {
      if (!date) return;

      this.container = new Renderer('p')
        .addClass('next-air-date')
        .setText(chrome.i18n.getMessage('nextEpisodeAirsAt', [Intl.DateTimeFormat(undefined, {
          day: '2-digit',
          weekday: 'long',
          month: '2-digit',
        }).format(date), Intl.DateTimeFormat(undefined, {
          minute: '2-digit',
          hour: '2-digit',
        }).format(date)]))
        .getElement();
      this.actionButtons.append(this.container);
    });
  }

  getAirDate(callback) {
    if (!window.anilistCache) {
      window.anilistCache = {};
    }
    if (window.anilistCache[this.seriesId] && window.anilistCache[this.seriesId].nextAiringDate > new Date(Date.now())) {
      callback(window.anilistCache[this.seriesId].nextAiringDate);
    } else {
      chrome.runtime.sendMessage(chrome.runtime.id, {
        type: 'anilist',
        data: {
          query: `query {
            Media(search: "${document.location.pathname.split('/').slice(-1)[0]}", type: ANIME, status: RELEASING) {
              nextAiringEpisode {
                airingAt
              }
            }
          }`,
        },
      }, (response) => {
        const airingAt = response.data.Media?.nextAiringEpisode?.airingAt;

        if (!window.anilistCache[this.seriesId]) {
          window.anilistCache[this.seriesId] = {};
        }
        if (airingAt) {
          this.seasons.then(seasons => {
            return this.episodes[seasons.sort((a, b) => {
              return b.season_sequence_number - a.season_sequence_number;
            })[0].id].then(episodes => {
              return episodes.sort((a, b) => {
                return b.sequence_number - a.sequence_number;
              })[0];
            });
          }).then(lastEpisode => {
            const airingAtDate = new Date(airingAt * 1000);
            const lastEpisodeDate = new Date(!lastEpisode.availability_starts.startsWith('9') ? lastEpisode.availability_starts : lastEpisode.episode_air_date);
            window.anilistCache[this.seriesId].nextAiringDate = new Date(
              airingAtDate.getFullYear(),
              airingAtDate.getMonth(),
              airingAtDate.getDate(),
              lastEpisodeDate.getHours(),
              lastEpisodeDate.getMinutes(),
              lastEpisodeDate.getSeconds(),
            );
            callback(window.anilistCache[this.seriesId].nextAiringDate);
          });
        } else {
          window.anilistCache[this.seriesId].nextAiringDate = null;
        }
      });
    }
  }

  destroy() {
    this.container?.remove();
  }
}
