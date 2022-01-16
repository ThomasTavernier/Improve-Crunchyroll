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
    const cxApiParams = fetch(window.location.origin)
      .then((response) => response.text())
      .then((text) => {
        const {
          cxApiParams: { apiDomain, accountAuthClientId },
        } = JSON.parse(text.match(/(?<=window.__APP_CONFIG__ = ){.*}/)[0]);
        return { apiDomain, accountAuthClientId };
      });
    const get = () => {
      Object.defineProperty(this, 'TOKEN', {
        value: cxApiParams.then(({ apiDomain, accountAuthClientId }) => {
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
              return { Authorization: `${token_type} ${access_token}`, apiDomain };
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
      value: this.TOKEN.then(({ apiDomain, Authorization }) =>
        fetch(`${apiDomain}/index/v2`, {
          headers: {
            Authorization: Authorization,
          },
        })
          .then((response) => response.json())
          .then(({ cms: { bucket, signature, policy, key_pair_id } }) => {
            return {
              apiDomain,
              bucket,
              searchParams: {
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

  skippers({ data: { mediaId } }, _, sendResponse) {
    return new Promise((resolve, reject) => {
      this.objects(mediaId).then(
        ({
          items: [
            {
              episode_metadata: { season_id },
            },
          ],
        }) => {
          this.episodes(season_id).then(({ items }) => {
            let isUpNext = true;
            const item = items.find(
              ({ next_episode_id, id }, i) =>
                next_episode_id === mediaId || ((isUpNext = isUpNext && id !== mediaId) && i === items.length - 1),
            );
            if (item) {
              this.objects(item.id)
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
                .then(({ subtitles }) => {
                  resolve(Object.values(subtitles));
                });
            } else {
              reject();
            }
          });
        },
      );
    })
      .then(sendResponse)
      .catch(() => sendResponse([]));
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
