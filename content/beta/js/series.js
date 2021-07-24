class Series {
  constructor() {
    new MarkAsWatchedNotWatched();
  }
}

class MarkAsWatchedNotWatched {
  seasons = new Proxy(
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

  constructor() {
    const series_id = location.pathname.match(/(?<=\/series\/)[^\/]*/);
    if (!series_id) return;
    const seasons = API.seasons(series_id[0]);
    const appBodyWrapper = document.querySelector('.app-body-wrapper');
    if (!appBodyWrapper) return;
    const ercSeasonWithNavigation = appBodyWrapper.querySelector('.erc-season-with-navigation');
    if (ercSeasonWithNavigation) {
      seasons.then(({ items: seasons }) =>
        this.seasons[this.getCurrentSeasonId(seasons)].then((episodes) => {
          ercSeasonWithNavigation.querySelectorAll('.card').forEach((card) => {
            this.card(card, seasons, episodes);
          });
          this.watchCollection(ercSeasonWithNavigation, seasons, episodes);
        }),
      );
      this.watchSeason(seasons, ercSeasonWithNavigation);
    } else {
      new MutationObserver((_, observer) => {
        const ercSeasonWithNavigation = appBodyWrapper.querySelector('.erc-season-with-navigation');
        if (!ercSeasonWithNavigation) return;
        observer.disconnect();
        this.watchSeason(seasons, ercSeasonWithNavigation);
      }).observe(appBodyWrapper, {
        childList: true,
      });
    }
  }

  watchSeason(seasons, ercSeasonWithNavigation) {
    new MutationObserver((mutations) => {
      seasons.then(({ items: seasons }) =>
        this.seasons[this.getCurrentSeasonId(seasons)]
          .then((episodes) => {
            mutations.forEach((mutation) =>
              mutation.addedNodes.forEach((node) => {
                if (node.classList.contains('erc-season-episode-list')) {
                  node.querySelectorAll('.card').forEach((card) => {
                    this.card(card, seasons, episodes);
                  });
                }
              }),
            );
            this.watchCollection(ercSeasonWithNavigation, seasons, episodes);
          })
          .catch(),
      );
    }).observe(ercSeasonWithNavigation, {
      childList: true,
    });
  }

  watchCollection(ercSeasonWithNavigation, seasons, episodes) {
    const ercPlayableCollection = ercSeasonWithNavigation.querySelector('.erc-playable-collection');
    if (!ercPlayableCollection) return;
    new MutationObserver((mutations) => {
      mutations.forEach((mutation) =>
        mutation.addedNodes.forEach((card) => {
          if (card.classList.contains('card')) {
            this.card(card, seasons, episodes);
          }
        }),
      );
    }).observe(ercPlayableCollection, {
      childList: true,
    });
  }

  getCurrentSeasonId(seasons) {
    const currentSeasonH4 = document.querySelector('div.seasons-select h4');
    const currentSeason =
      seasons.length > 1
        ? seasons.find(
        ({ title }) => currentSeasonH4 && currentSeasonH4.innerText && currentSeasonH4.innerText.endsWith(title),
        )
        : seasons[0];
    return currentSeason && currentSeason.id;
  }

  card(card, seasons, episodes) {
    new MutationObserver((mutations) => {
      if (
        mutations
          .flatMap((mutation) => [...mutation.addedNodes])
          .some((node) => node.classList.contains('c-playable-card'))
      ) {
        this.seasons[this.getCurrentSeasonId(seasons)].then((episodes) => {
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
    if (!body) return;
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
    const select = document.querySelector('.seasons-select');
    if (select) {
      const selectButton = select.querySelector('[role=button]');
      if (selectButton) {
        selectButton.click();
        const active = select.querySelector('.c-select-option--active');
        if (active) {
          active.click();
          return;
        }
      }
    }
    location.reload();
  }
}
