const API = new (class {
  constructor() {
    chrome.runtime.onMessage.addListener(function ({ type }, __, sendResponse) {
      const { [type]: action } = API;
      if (typeof action !== 'function' || !action.apply(API, arguments)) {
        sendResponse();
      }
      return true;
    });
  }

  get TOKEN() {
    const cxApiParams = fetch(window.location.href)
      .then((response) => response.text())
      .then((text) => {
        const {
          localization: { locale },
        } = JSON.parse(text.match(/(?<=window.__INITIAL_STATE__ = ){.*}/)[0]);
        const {
          cxApiParams: { apiDomain, accountAuthClientId },
        } = JSON.parse(text.match(/(?<=window.__APP_CONFIG__ = ){.*}/)[0]);
        return { apiDomain, accountAuthClientId, locale };
      });
    const get = () => {
      Object.defineProperty(this, 'TOKEN', {
        value: cxApiParams.then(({ apiDomain, accountAuthClientId, locale }) => {
          return fetch(`${apiDomain}/auth/v1/token`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${window.btoa(`${accountAuthClientId}:`)}`,
            },
            body: 'grant_type=etp_rt_cookie',
          })
            .then((response) => response.json())
            .then(({ token_type, access_token, expires_in }) => {
              setTimeout(() => {
                Object.defineProperty(this, 'TOKEN', {
                  get,
                });
              }, expires_in * 1000);
              return { Authorization: `${token_type} ${access_token}`, apiDomain, locale };
            });
        }),
        configurable: true,
      });
      return this.TOKEN;
    };
    return get();
  }

  get ME() {
    Object.defineProperty(this, 'ME', {
      value: this.TOKEN.then(({ apiDomain, Authorization }) => {
        return fetch(`${apiDomain}/accounts/v1/me`, {
          headers: {
            Authorization: Authorization,
          },
        })
          .then((response) => response.json())
          .then(({ account_id }) => {
            return { account_id };
          });
      }),
    });
    return this.ME;
  }

  get CMS() {
    Object.defineProperty(this, 'CMS', {
      value: this.TOKEN.then(({ apiDomain, Authorization, locale }) =>
        fetch(`${apiDomain}/index/v2`, {
          headers: {
            Authorization: Authorization,
          },
        })
          .then((response) => response.json())
          .then(({ cms_beta: { bucket, signature, policy, key_pair_id } }) => {
            return {
              apiDomain,
              bucket,
              searchParams: {
                locale,
                Signature: signature,
                Policy: policy,
                'Key-Pair-Id': key_pair_id,
              },
            };
          }),
      ),
    });
    return this.CMS;
  }

  skippers(
    { data: { mediaId, episode_number: currentEpisodeNumber, title: currentTitle, subtitles: currentSubtitles } },
    _,
    sendResponse,
  ) {
    return this.objects(mediaId)
      .then(
        ({
          items: [
            {
              episode_metadata: { season_id, season_number, series_id, is_subbed, series_slug_title },
            },
          ],
        }) =>
          is_subbed
            ? this.episodes(season_id)
                .then(({ items }) => {
                  let isUpNext = true;
                  return this.subtitles(
                    items.find(
                      ({ next_episode_id, id }, i) =>
                        next_episode_id === mediaId ||
                        ((isUpNext = isUpNext && id !== mediaId) && i === items.length - 1),
                    ).id,
                  );
                })
                .then((previousSubtitles) => [currentSubtitles, previousSubtitles])
                .then((v) => {
                  console.log(v);
                  return v;
                })
            : this.seasons(series_id)
                .then(({ items }) => this.findSeasonBySeasonNumber(items, season_number))
                .then(
                  (season) =>
                    season ||
                    this.search(series_slug_title)
                      .then(({ items }) =>
                        items
                          .find(({ type }) => type === 'series')
                          .items.find(({ series_metadata: { is_subbed } }) => is_subbed),
                      )
                      .then(({ id }) => this.seasons(id))
                      .then(({ items }) => this.findSeasonBySeasonNumber(items, season_number)),
                )
                .then((season) => this.episodes(season.id))
                .then(({ items }) =>
                  Promise.all(
                    items
                      .splice(
                        items
                          .reverse()
                          .findIndex(
                            ({ episode_number, title }) =>
                              episode_number === currentEpisodeNumber && currentTitle === title,
                          ),
                        2,
                      )
                      .map(({ id }) => this.subtitles(id)),
                  ),
                ),
      )
      .catch(() => sendResponse([]))
      .then(sendResponse);
  }

  findSeasonBySeasonNumber(items, season_number) {
    return items.find(
      ({ season_number: itemSeason_number, is_subbed }) => itemSeason_number === season_number && is_subbed === true,
    );
  }

  subtitles(objectId) {
    return this.objects(objectId)
      .then(
        ({
          items: [
            {
              __links__: {
                streams: { href },
              },
            },
          ],
        }) => this._fetch(href),
      )
      .then((response) => response.json())
      .then(({ subtitles }) => Object.values(subtitles));
  }

  objects(objectId) {
    return this._fetchCmsV2(`objects/${objectId}`, undefined, {
      credentials: 'same-origin',
    });
  }

  seasons(series_id) {
    return this._fetchCmsV2('seasons', { series_id });
  }

  episodes(season_id) {
    return this._fetchCmsV2('episodes', { season_id });
  }

  search(q) {
    return this.TOKEN.then(({ Authorization, locale }) =>
      this._fetch(
        `/content/v1/search`,
        { q, locale },
        {
          method: 'GET',
          headers: {
            Authorization,
            'Content-Type': 'application/json',
          },
        },
      ).then((response) => response.json()),
    );
  }

  up_next_series(series_id) {
    return this.TOKEN.then(({ Authorization }) =>
      this._fetch(
        `/content/v1/up_next_series`,
        { series_id },
        {
          method: 'GET',
          headers: {
            Authorization,
            'Content-Type': 'application/json',
          },
        },
      ).then((response) => response.json()),
    );
  }

  playheads(content_id, playheadMs) {
    return Promise.all([this.TOKEN, this.ME]).then(([{ Authorization }, { account_id }]) =>
      this._fetch(`/content/v1/playheads/${account_id}`, undefined, {
        method: 'POST',
        headers: {
          Authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content_id, playhead: ~~(playheadMs / 1000) }),
      }),
    );
  }

  _fetchCmsV2(href, searchParams, requestInit) {
    return this.CMS.then(({ bucket }) =>
      this._fetch(`/cms/v2${bucket}/${href}`, searchParams, requestInit).then((response) => response.json()),
    );
  }

  _fetch(href, searchParams, requestInit) {
    return this.CMS.then(({ apiDomain, searchParams: cmsSearchParams }) =>
      fetch(
        `${apiDomain}${href}?${new URLSearchParams(
          searchParams ? { ...cmsSearchParams, ...searchParams } : cmsSearchParams,
        )}`,
        requestInit,
      ),
    );
  }
})();
