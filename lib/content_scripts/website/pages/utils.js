function animeListButtons(title, callback) {
  let simpleTitle = null;

  // remove the season number prefix ('S1:', 'S2:', ...)
  title = title.replace(/^S\d+\s*[:-]\s*/, '');
  // remove the dub or episode indicator that some season have ('(German Dub)', '(English Dub)', '(25+)', ...)
  title = title.replace(/\([\w\s+-]+\)/, '');
  title = title.trim();

  // Check if the title is generic (e.g., 'Season 1', 'Season 2', etc.)
  // If so, use the series title from the page title instead to avoid incorrect linking
  const seasonPattern = /Season\s+(\d+)/i;
  if (seasonPattern.test(title) || /^OVAs?$/i.test(title)) {
    let seriesTitle = null;

    // Pattern 1: Series page - "Watch {title} - Crunchyroll"
    const seriesMatch = document.title.match(/^Watch\s+(.+?)\s+-\s+Crunchyroll$/i);
    if (seriesMatch) {
      seriesTitle = seriesMatch[1];
    } else {
      // Pattern 2: Watch page - "{title} ({dub}) {ep title} - Watch on Crunchyroll"
      seriesTitle = document.title.replace(/(\([\w\s+-]+\) .+)?\s+-\s+(Watch on )?Crunchyroll$/i, '').trim();
      seriesTitle = seriesTitle.replace(/^Watch\s+/i, '');
    }

    // Clean up dub/episode indicators
    seriesTitle = seriesTitle.replace(/\([\w\s+-]+\)/, '').trim();

    if (seriesTitle) {
      // If the series title doesn't already contain the current title, append it back to ensure correct linking
      if (!seriesTitle.toLowerCase().includes(title.toLowerCase())) {
        simpleTitle = seriesTitle;

        let seasonMatch = title.match(seasonPattern);
        let seasonNumber = seasonMatch ? seasonMatch[1] : null;
        if (seasonNumber && seasonNumber !== '1') {
          seriesTitle += ` Season ${seasonNumber}`;
        }
      }

      title = seriesTitle;
    }
  }

  const callCallback = (anilistId, malId) => {
    let anilistButton;
    let malButton;
    if (anilistId) {
      anilistButton = new Renderer('a')
        .addClass('anime-list-link')
        .setAttribute('href', `https://anilist.co/anime/${anilistId}`)
        .setAttribute('target', '_blank')
        .appendChildren(
          new SvgRenderer('svg')
            .setAttribute('viewBox', '0 0 1024 1024')
            .appendChildren(
              new SvgRenderer('path')
                .setAttribute('fill', '#1e2630')
                .setAttribute('d', 'M0 0h1024v1024H0Z'),
              new SvgRenderer('path')
                .setAttribute('fill', '#02a9ff')
                .setAttribute('d', 'M643.84 646.54V273.199c0-21.395-11.773-33.203-33.116-33.203h-72.865c-21.344 0-33.123 11.808-33.123 33.203v177.303c0 4.993 47.992 28.178 49.245 33.082 36.565 143.219 7.945 257.84-26.717 263.2 56.675 2.81 62.91 30.128 20.696 11.462 6.458-76.418 31.656-76.269 104.098-2.812.62.634 14.854 30.564 15.74 30.564h171.09c21.344 0 33.116-11.8 33.116-33.2v-73.048c0-21.396-11.772-33.203-33.116-33.203z'),
              new SvgRenderer('path')
                .setAttribute('fill', '#fefefe')
                .setAttribute('d', 'M341.36 240 149.999 786h148.676l32.384-94.444h161.92L524.63 786h147.936L481.938 240Zm23.553 330.56 46.365-151.258 50.785 151.258z'),
            ),
        );
    }
    if (malId) {
      malButton = new Renderer('a')
        .addClass('anime-list-link')
        .setAttribute('href', `https://myanimelist.net/anime/${malId}`)
        .setAttribute('target', '_blank')
        .appendChildren(
          new SvgRenderer('svg')
            .setAttribute('viewBox', '0 0 1024 1024')
            .appendChildren(
              new SvgRenderer('path')
                .setAttribute('fill', '#2e51a2')
                .setAttribute('d', 'M0 0h1024v1024H0Z'),
              new SvgRenderer('path')
                .setAttribute('fill', '#fff')
                .setAttribute('d', 'M387.56 353.284v281.231l-70.21-.094v-174.1l-67.784 80.273-66.407-82.073-.673 176.464h-71.149V353.347h73.56l62.274 84.969 67.3-85zm288.07 69.083.83 211.522H597.5l-.265-95.862h-93.483c2.332 16.669 7.012 42.258 13.93 59.474 5.18 12.724 9.953 25.041 19.469 37.656l-56.922 37.562c-11.66-21.238-20.769-44.636-29.314-69.521a310.373 310.373 0 0 1-16.935-72.761c-2.833-25.042-3.24-49.113 3.569-73.857a130.481 130.481 0 0 1 38.767-62.306c10.455-9.782 25.041-16.7 36.733-22.944 11.69-6.245 24.806-8.812 36.967-11.989a247.284 247.284 0 0 1 39.769-6.104c13.287-1.142 36.967-2.206 79.82-.939l18.201 58.394H595.81c-19.798.266-29.314 0-44.777 6.98a74.655 74.655 0 0 0-42.664 64.169l88.913 1.095 1.267-60.428h77.097zm133.299-70.037v221.225l103.734 1.017-14.352 59.27h-160.5V351.281Z'),
            ),
        );
    }

    callback([anilistButton, malButton]);
  };

  const fetchAnilist = (search, cb) => {
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: 'anilist',
      data: {
        query: `query { Media(search: ${JSON.stringify(search)}, type: ANIME) { id idMal } }`,
      },
    }, (response) => {
      if (response && response.data && response.data.Media) {
        cb(response.data.Media.id, response.data.Media.idMal);
      } else {
        cb(null, null);
      }
    });
  };

  // First check the cache to avoid unnecessary API calls
  if (window.anilistCache && window.anilistCache[title]) {
    callCallback(window.anilistCache[title].anilistId, window.anilistCache[title].malId);
  } else {
    // If not in cache, fetch from Anilist API using the full title first
    fetchAnilist(title, (anilistId, malId) => {
      if (anilistId || malId) {
        // Found a match with the full title, cache it and return the buttons
        if (!window.anilistCache) window.anilistCache = {};
        window.anilistCache[title] = { anilistId, malId };
        callCallback(anilistId, malId);
      } else if (simpleTitle) {
        // If no match with the full title, try again with the simplified title (without season)
        fetchAnilist(simpleTitle, (a2, m2) => {
          if (a2 || m2) {
            // Found a match with the simplified title, cache it and return the buttons
            if (!window.anilistCache) window.anilistCache = {};
            window.anilistCache[title] = { anilistId: a2, malId: m2 };
            callCallback(a2, m2);
          } else {
            // No match found even with the simplified title, cache the null result to avoid future lookups and return no buttons
            if (!window.anilistCache) window.anilistCache = {};
            window.anilistCache[title] = { anilistId: null, malId: null };
            callCallback(null, null);
          }
        });
      } else {
        // No match found and no simplified title available, cache the null result to avoid future lookups and return no buttons
        if (!window.anilistCache) window.anilistCache = {};
        window.anilistCache[title] = { anilistId: null, malId: null };
        callCallback(null, null);
      }
    });
  }
}
