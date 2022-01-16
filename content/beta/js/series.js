class Series extends Empty {
  constructor() {
    super();
    this.markAsWatchedNotWatched = new MarkAsWatchedNotWatched();
  }

  onDestroy() {
    super.onDestroy();
    this.markAsWatchedNotWatched.destroy();
  }
}

class MarkAsWatchedNotWatched {
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
  locationReloadTimeOut;

  constructor() {
    this.refresh = this.refresh.bind(this);
    [this.series_id] = location.pathname.match(/(?<=\/series\/)[^\/]*/) || [];
    if (!this.series_id) return;
    const appBodyWrapper = document.querySelector('.app-body-wrapper');
    if (!appBodyWrapper) return;
    const ercSeasonWithNavigation = appBodyWrapper.querySelector('.erc-season-with-navigation');
    if (ercSeasonWithNavigation) {
      this.getCurrentSeasonEpisodes().then((episodes) => {
        ercSeasonWithNavigation.querySelectorAll('.card').forEach((card) => {
          this.card(card, episodes);
        });
        this.watchCollection(ercSeasonWithNavigation);
      });
      this.watchSeason(ercSeasonWithNavigation);
    } else {
      new MutationObserver((_, observer) => {
        const ercSeasonWithNavigation = appBodyWrapper.querySelector('.erc-season-with-navigation');
        if (!ercSeasonWithNavigation) return;
        observer.disconnect();
        this.watchSeason(ercSeasonWithNavigation);
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
    clearInterval(this.locationReloadTimeOut);
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
          ({ items }) => this.episodes[items.find(({ title }) => currentSeasonH4.innerText.endsWith(title)).id],
        )
      : this.upNextSeries.then(
          ({
            panel: {
              episode_metadata: { season_id },
            },
          }) => {
            return this.episodes[season_id];
          },
        );
  }

  card(card, episodes) {
    new MutationObserver((mutations) => {
      if (
        mutations
          .flatMap((mutation) => [...mutation.addedNodes])
          .some((node) => node.classList.contains('c-playable-card'))
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

  createCard(card, { items: episodes }) {
    const body = card.querySelector('.c-playable-card__body');
    if (!body || body.querySelector('.ic_action')) return;
    const a = card.querySelector('a');
    if (!a) return;
    const episode = episodes.find(({ id }) => {
      return a.href.includes(id);
    });
    if (!episode) return;
    const { id, sequence_number: episode_sequence_number, duration_ms } = episode;
    const {
      0: { sequence_number: first_episode_sequence_number },
      length,
      [length - 1]: { sequence_number: last_episode_sequence_number },
    } = episodes;
    body.appendChild(
      createActionMenuButton([
        {
          name: 'KEY_MARK_AS_WATCHED',
          subMenus: [
            {
              name: 'KEY_MARK_ONLY_THIS_ONE',
              action: () => {
                API.playheads(id, duration_ms).then(this.refresh);
              },
            },
            {
              name: 'KEY_MARK_ALL_PREVIOUS',
              if: () => episode_sequence_number > first_episode_sequence_number,
              action: () => {
                Promise.all(
                  episodes
                    .filter(({ sequence_number }) => sequence_number <= episode_sequence_number)
                    .map(({ id, duration_ms }) => API.playheads(id, duration_ms)),
                ).then(this.refresh);
              },
            },
          ],
        },
        {
          name: 'KEY_MARK_AS_NOT_WATCHED',
          subMenus: [
            {
              name: 'KEY_MARK_ONLY_THIS_ONE',
              action: () => {
                API.playheads(id, 0).then(this.refresh);
              },
            },
            {
              name: 'KEY_MARK_ALL_NEXT',
              if: () => last_episode_sequence_number !== episode_sequence_number,
              action: () => {
                Promise.all(
                  episodes
                    .filter(({ sequence_number }) => sequence_number >= episode_sequence_number)
                    .map(({ id }) => API.playheads(id, 0)),
                ).then(this.refresh);
              },
            },
          ],
        },
      ]),
    );
  }

  refresh() {
    clearTimeout(this.locationReloadTimeOut);
    const select = document.querySelector('.seasons-select');
    if (select) {
      const selectButton = select.querySelector('[role=button]');
      if (selectButton) {
        selectButton.click();
        const active = select.querySelector('[class*="active"]');
        if (active) {
          active.click();
          return;
        }
      }
    }
    this.locationReloadTimeOut = setTimeout(() => location.reload(), 2500);
  }
}
