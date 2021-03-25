const API = new (class {
  LOADED = fetch(window.location.origin)
    .then((response) => response.text())
    .then((text) => {
      const {
        cxApiParams: { apiDomain, accountAuthClientId },
      } = JSON.parse(text.match(/(?<=window.__APP_CONFIG__ = ){.*}/)[0]);
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
        .then(({ token_type, access_token }) => {
          const Authorization = `${token_type} ${access_token}`;
          return Promise.all(
            ['/index/v2', '/accounts/v1/me'].map((pathname) =>
              fetch(`${apiDomain}${pathname}`, {
                headers: {
                  Authorization: Authorization,
                },
              }).then((response) => response.json())
            )
          ).then(
            ([
              {
                cms: { bucket, signature, policy, key_pair_id },
              },
              { account_id },
            ]) => {
              return {
                Authorization,
                account_id,
                apiDomain,
                bucket,
                searchParams: {
                  Signature: signature,
                  Policy: policy,
                  'Key-Pair-Id': key_pair_id,
                },
              };
            }
          );
        });
    });

  constructor() {
    chrome.runtime.onMessage.addListener(function ({ type }, __, sendResponse) {
      const { [type]: action } = API;
      if (typeof action !== 'function' || !action.apply(API, arguments)) {
        sendResponse();
      }
      return true;
    });
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
            const item = items.find(({ next_episode_id }) => next_episode_id === mediaId);
            if (item) {
              this.objects(item.id)
                .then(({ items: [{ __links__: { streams: { href } } }] }) => this.fetch(href))
                .then(({ subtitles }) => {
                  resolve(Object.values(subtitles));
                });
            } else {
              reject();
            }
          });
        }
      );
    })
      .then(sendResponse)
      .catch(() => sendResponse([]));
  }

  objects(objectId) {
    return this.LOADED.then((apiInfos) =>
      this._fetchCmsV2(apiInfos, `objects/${objectId}`, {
        credentials: 'same-origin',
      })
    );
  }

  seasons(series_id) {
    return this.LOADED.then(({ apiDomain, bucket, searchParams }) =>
      this._fetchCmsV2(
        {
          apiDomain,
          bucket,
          searchParams: { ...searchParams, series_id },
        },
        'seasons'
      )
    );
  }

  episodes(season_id) {
    return this.LOADED.then(({ apiDomain, bucket, searchParams }) =>
      this._fetchCmsV2(
        {
          apiDomain,
          bucket,
          searchParams: { ...searchParams, season_id },
        },
        'episodes'
      )
    );
  }

  playheads(content_id, playheadMs) {
    return this.LOADED.then(({ apiDomain, account_id, Authorization }) =>
      this._fetchContentV1({ apiDomain }, `playheads/${account_id}`, {
        method: 'POST',
        headers: {
          Authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content_id, playhead: ~~(playheadMs / 1000) }),
      })
    );
  }

  fetch(href) {
    return this.LOADED.then((apiInfos) => this._fetch(apiInfos, href).then((response) => response.json()));
  }

  _fetchContentV1({ apiDomain }, href, requestInit) {
    return this._fetch({ apiDomain }, `/content/v1/${href}`, requestInit);
  }

  _fetchCmsV2({ apiDomain, bucket, searchParams }, href, requestInit) {
    return this._fetch({ apiDomain, searchParams }, `/cms/v2${bucket}/${href}`, requestInit).then((response) =>
      response.json()
    );
  }

  _fetch({ apiDomain, searchParams }, href, requestInit) {
    return fetch(`${apiDomain}${href}?${new URLSearchParams(searchParams)}`, requestInit);
  }
})();
