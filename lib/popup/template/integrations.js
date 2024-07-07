core.main.integrations = {
  type: 'folder',
  label: 'integrations',
  icon: new SvgRenderer('svg')
    .setAttribute('viewBox', '0 0 512 512')
    .appendChildren(
      new SvgRenderer('path').setAttribute(
        'd',
        'M160 0c-17.7 0-32 14.3-32 32v96h64V32c0-17.7-14.3-32-32-32m192 0c-17.7 0-32 14.3-32 32v96h64V32c0-17.7-14.3-32-32-32M96 160c-17.7 0-32 14.3-32 32s14.3 32 32 32v32c0 77.4 55 142 128 156.8V480c0 17.7 14.3 32 32 32s32-14.3 32-32v-67.2C361 398 416 333.4 416 256v-32c17.7 0 32-14.3 32-32s-14.3-32-32-32z',
      ),
    ),

  content: {
    type: 'main',
    label: 'integrations',

    content: {
      episode_air_date: {
        type: 'section',
        label: 'showEpisodeAirDate',

        content: {
          series: {
            type: 'checkbox',
            key: 'episode_air_date_series',
            label: 'showOnSeries',
          },
        },
      },
      anime_lists: {
        type: 'section',
        label: 'animeListLinks',

        content: {
          anilist: {
            type: 'select',
            key: 'anilist_link',
            label: 'AniList',
            options: [
              {
                label: 'doNotShow',
                value: '',
              },
              {
                label: 'showOnSeries',
                value: 'series',
              },
              {
                label: 'showOnWatch',
                value: 'watch',
              },
              {
                label: 'showOnSeriesAndWatch',
                value: 'series,watch',
              },
            ],
          },
          myanimelist: {
            type: 'select',
            key: 'myanimelist_link',
            label: 'MyAnimeList',
            options: [
              {
                label: 'doNotShow',
                value: '',
              },
              {
                label: 'showOnSeries',
                value: 'series',
              },
              {
                label: 'showOnWatch',
                value: 'watch',
              },
              {
                label: 'showOnSeriesAndWatch',
                value: 'series,watch',
              },
            ],
          },
        },
      },
    },
  },
};
