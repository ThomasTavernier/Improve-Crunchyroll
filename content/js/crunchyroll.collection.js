const seasons = document.querySelectorAll('.list-of-seasons .season');
if (seasons.length > 0) {
  [...seasons].forEach((season) => {
    const episodes = season.querySelectorAll('.group-item');
    if (episodes.length > 0) {
      const episodesIds = [];
      episodes.forEach((episode) => {
        const episodeId = ~~episode.id.replace(/\D/g, '');
        if (episodeId > 0) {
          const episodeIdPostion = episodesIds.length;
          episodesIds.push(episodeId);
          episode.appendChild(
            createActionMenuButton([
              {
                name: 'KEY_MARK_AS_WATCHED',
                subMenus: [
                  {
                    name: 'KEY_MARK_ONLY_THIS_ONE',
                    action: () => markAsWatched(episodeId),
                  },
                  {
                    name: 'KEY_MARK_ALL_PREVIOUS',
                    if: () => episodes.length !== episodeIdPostion + 1,
                    action: () => markAsWatched(episodesIds.filter((value, index) => index >= episodeIdPostion)),
                  },
                ],
              },
              {
                name: 'KEY_MARK_AS_NOT_WATCHED',
                subMenus: [
                  {
                    name: 'KEY_MARK_ONLY_THIS_ONE',
                    action: () => markAsNotWatched(episodeId),
                  },
                  {
                    name: 'KEY_MARK_ALL_NEXT',
                    if: () => episodeIdPostion > 0,
                    action: () => markAsNotWatched(episodesIds.filter((value, index) => index <= episodeIdPostion)),
                  },
                ],
              },
            ]),
          );
        }
      });
    }
  });
}

function markAsWatched(...episodesId) {
  const episodesIds = episodesId.flat();
  return new Promise((resolve, reject) =>
    Promise.all(
      episodesIds.map(
        (episodeId) =>
          new Promise((resolve, reject) =>
            fetch(`https://www.crunchyroll.com/showmedia?id=${episodeId}`)
              .then((data) => data.text())
              .then((text) => {
                try {
                  resolve(
                    fetch(
                      `https://www.crunchyroll.com/ajax/?req=RpcApiVideo_VideoView&cbcallcount=0&cbelapsed=0&playhead=${
                        ~~JSON.parse(text.match(/{"metadata":.+}/)).metadata.duration / 1000
                      }&media_id=${episodeId}`,
                    ),
                  );
                } catch (error) {
                  reject(error);
                }
              })
              .catch(reject),
          ),
      ),
    )
      .then(() => fetchAndFill(episodesIds).then(resolve).catch(reject))
      .catch(reject),
  );
}

function markAsNotWatched(...episodesId) {
  const episodesIds = episodesId.flat();
  return new Promise((resolve, reject) =>
    Promise.all(
      episodesIds.map((episodeId) =>
        fetch(
          `https://www.crunchyroll.com/ajax/?req=RpcApiVideo_VideoView&cbcallcount=0&cbelapsed=0&playhead=${0}&media_id=${episodeId}`,
        ),
      ),
    )
      .then(() => fetchAndFill(episodesIds).then(resolve).catch(reject))
      .catch(reject),
  );
}

function fetchAndFill(episodesIds) {
  return new Promise((resolve, reject) =>
    fetch(window.location.href)
      .then((data) => data.text())
      .then((text) => {
        text = text.replace(/[\r\n]/g, '');
        episodesIds.forEach((episodeId) => {
          const episodeProgress = document.querySelector(`#showview_videos_media_${episodeId} .episode-progress`);
          if (episodeProgress) {
            episodeProgress.style.width = `${parseFloat(
              ((text.match(new RegExp(`${episodeId}(.*?)%`)) || [''])[0].match(/(\d*\.)?\d+%$/) || [])[0],
            )}%`;
          }
        });
        resolve();
      })
      .catch(reject),
  );
}
