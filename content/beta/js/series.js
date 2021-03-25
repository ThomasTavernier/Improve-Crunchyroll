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
    }
  );

  constructor() {
    this.init = this.init.bind(this);
    const targets = [
      document.querySelector('div.seasons-select h4'),
      document.querySelector('div.erc-season-with-navigation span'),
    ].filter((target) => target);
    if (targets.length === 0) return;
    const series_id = location.pathname.match(/(?<=\/series\/)[^\/]*/);
    if (!series_id) return;
    const seasons = API.seasons(series_id[0]);
    targets.forEach((target) => {
      new MutationObserver(() => {
        seasons.then(this.init);
      }).observe(target, {
        subtree: true,
        characterData: true,
      });
    });
    seasons.then(this.init);
  }

  init({ items: seasons }) {
    const currentSeasonH4 = document.querySelector('div.seasons-select h4');
    const currentSeason =
      seasons.length > 1
        ? seasons.find(
            ({ title }) => currentSeasonH4 && currentSeasonH4.innerText && currentSeasonH4.innerText.endsWith(title)
          )
        : seasons[0];
    if (!currentSeason || !currentSeason.id) return;
    this.seasons[currentSeason.id].then((data) => {
      if (document.querySelector('.erc-season-episode-list')) {
        this.appendActionMenuButtons(data);
      } else {
        const target = document.querySelector('.erc-season-with-navigation');
        if (!target) return;
        new MutationObserver((_, observer) => {
          observer.disconnect();
          this.appendActionMenuButtons(data);
        }).observe(target, {
          childList: true,
        });
      }
    });
  }

  appendActionMenuButtons({ items: episodes }) {
    document.querySelectorAll('.card').forEach((card) => {
      const body = card.querySelector('.c-playable-card__body');
      if (!body) return;
      const a = card.querySelector('a');
      if (!a) return;
      const episode = episodes.find(({ id }) => {
        return a.href.includes(id);
      });
      if (!episode) return;
      const { id, sequence_number: episode_sequence_number, duration_ms } = episode;
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
                if: () => episode_sequence_number > 1,
                action: () => {
                  Promise.all(
                    episodes
                      .filter(({ sequence_number }) => sequence_number <= episode_sequence_number)
                      .map(({ id, duration_ms }) => API.playheads(id, duration_ms))
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
                if: () => episodes.length !== episode_sequence_number,
                action: () => {
                  Promise.all(
                    episodes
                      .filter(({ sequence_number }) => sequence_number >= episode_sequence_number)
                      .map(({ id }) => API.playheads(id, 0))
                  ).then(this.refresh);
                },
              },
            ],
          },
        ])
      );
    });
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
