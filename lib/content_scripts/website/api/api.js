const API = new (class {
  constructor() {
    chrome.runtime.onMessage.addListener(function({ type }, __, sendResponse) {
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
          cxApiParams: { accountAuthClientId },
        } = JSON.parse(text.match(/(?<=window.__APP_CONFIG__ = ){.*}(?=<)/)[0]);
        return { apiDomain: location.origin, accountAuthClientId };
      });
    const get = () => {
      let browser;
      if (/Firefox/.test(navigator.userAgent)) browser = "Firefox";
      else if (/Safari/.test(navigator.userAgent)) browser = "Safari";
      else if (/Edge/.test(navigator.userAgent)) browser = "Edge";
      else browser = "Chrome";

      let os;
      if (/Linux/.test(navigator.userAgent)) os = "Linux";
      else if (/Mac/.test(navigator.userAgent)) os = "Mac";
      else os = "Windows";

      Object.defineProperty(this, 'TOKEN', {
        value: cxApiParams.then(({ apiDomain, accountAuthClientId }) => {
          const fetchToken = (grant_type) =>
            fetch(`${apiDomain}/auth/v1/token`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${window.btoa(`${accountAuthClientId}:`)}`,
              },
              body: new URLSearchParams({
                device_id: /(?<=(?:^| )device_id=)[^;]+/.exec(document.cookie)[0],
                device_type: `${browser} on ${os}`,
                grant_type: grant_type
              }),
            });
          return fetchToken('etp_rt_cookie')
            .then((response) => {
              if (response.ok) {
                return response;
              }
              return fetchToken('client_id');
            })
            .then((response) => response.json())
            .then(({ token_type, access_token, expires_in, account_id }) => {
              setTimeout(() => {
                Object.defineProperty(this, 'TOKEN', {
                  get,
                });
              }, expires_in * 1000);
              return { Authorization: `${token_type} ${access_token}`, apiDomain, account_id };
            });
        }),
        configurable: true,
      });
      return this.TOKEN;
    };
    return get();
  }

  get PROFILE() {
    const get = () => {
      Object.defineProperty(this, 'PROFILE', {
        value: this.TOKEN.then(({ account_id }) => {
          if (account_id) {
            return this.#getResponse('/accounts/v1/me/multiprofile').then(({ profiles }) => {
              const selectedProfile = profiles.find((profile) => profile.is_selected);
              if (selectedProfile) {
                return {
                  preferred_content_audio_language: selectedProfile.preferred_content_audio_language,
                };
              }
              return {};
            });
          }
          return {};
        }),
        configurable: true,
      });
      return this.PROFILE;
    };
    return get();
  }

  skippers(
    { data: { mediaId, episode_number: currentEpisodeNumber, title: currentTitle, subtitles: currentSubtitles } },
    _,
    sendResponse,
  ) {
    return this.objects(mediaId)
      .then(
        ([
           {
             episode_metadata: { season_number, series_id, is_subbed, series_slug_title },
           },
         ]) =>
          is_subbed
            ? this.previousEpisode(mediaId)
              .then(
                ([
                   {
                     panel: { streams_link },
                   },
                 ]) => {
                  return this.subtitles(streams_link);
                },
              )
              .catch((ignored) => {
                return {};
              })
              .then((previousSubtitles) => [currentSubtitles, previousSubtitles])
            : this.seasons(series_id)
              .then((seasons) => this.#findSeasonBySeasonNumber(seasons, season_number))
              .then(
                (season) =>
                  season ||
                  this.search(series_slug_title)
                    .then((items) =>
                      items
                        .find(({ type }) => type === 'series')
                        .items.find(({ series_metadata: { is_subbed } }) => is_subbed),
                    )
                    .then(({ id }) => this.seasons(id))
                    .then((seasons) => this.#findSeasonBySeasonNumber(seasons, season_number)),
              )
              .then((season) => this.episodes(season.id))
              .then((episodes) =>
                Promise.all(
                  episodes
                    .splice(
                      episodes
                        .reverse()
                        .findIndex(
                          ({ episode_number, title }) =>
                            episode_number === currentEpisodeNumber && currentTitle === title,
                        ),
                      2,
                    )
                    .map(({ id }) => this.objects(id).then(([{ streams_link }]) => this.subtitles(streams_link))),
                ),
              ),
      )
      .catch((err) => {
        return sendResponse([currentSubtitles, {}]);
      })
      .then(sendResponse);
  }

  #findSeasonBySeasonNumber(items, season_number) {
    return items.find(
      ({ season_number: itemSeason_number, is_subbed }) => itemSeason_number === season_number && is_subbed === true,
    );
  }

  subtitles(streams_link) {
    return this.#getResponse(streams_link).then(({ meta: { subtitles } }) => {
      return subtitles;
    });
  }

  objects(objectId) {
    return this.#get(`/content/v2/cms/objects/${objectId}`);
  }

  seasons(series_id) {
    return this.PROFILE.then(({ preferred_content_audio_language }) => {
      return this.#get(
        `/content/v2/cms/series/${series_id}/seasons`,
        preferred_content_audio_language ? { preferred_audio_language: preferred_content_audio_language } : {},
      );
    });
  }

  episodes(season_id) {
    return this.#get(`/content/v2/cms/seasons/${season_id}/episodes`);
  }

  previousEpisode(episodeId) {
    return this.#get(`/content/v2/discover/previous_episode/${episodeId}`);
  }

  search(q) {
    return this.#get(`/content/v2/discover/search`, { q });
  }

  up_next_series(series_id) {
    return this.#get(`/content/v2/discover/up_next/${series_id}`).then(
      ([
         {
           panel: {
             episode_metadata: { season_id },
           },
         },
       ]) => {
        return { season_id };
      },
    );
  }

  playheads(...data) {
    const dateWatched = new Date().toISOString();
    return this.TOKEN.then(({ account_id }) => {
      return this.#post(
        `/content/v2/${account_id}/playheads/batch`,
        JSON.stringify({
          batch: data.reduce((acc, { id, playheadMs }) => {
            acc[id] = {
              playhead: ~~(playheadMs / 1000),
              date_watched: dateWatched,
            };
            return acc;
          }, {}),
        }),
      );
    });
  }

  #fetch(href, searchParams = {}, requestInit = {}) {
    return this.TOKEN.then(({ Authorization, apiDomain }) =>
      fetch(`${apiDomain}${href}?${new URLSearchParams({ locale, ...searchParams })}`, {
        headers: {
          Authorization,
          'Content-Type': 'application/json',
        },
        ...requestInit,
      }),
    );
  }

  #getResponse(href, searchParams) {
    return this.#fetch(href, searchParams, {
      method: 'GET',
    }).then((response) => response.json());
  }

  #get(href, searchParams) {
    return this.#getResponse(href, searchParams).then(({ data }) => data);
  }

  #post(href, body) {
    return this.#fetch(
      href,
      {},
      {
        method: 'POST',
        body,
      },
    );
  }
})();
