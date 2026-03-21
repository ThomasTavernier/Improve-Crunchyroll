class PlayerChild extends Empty {
  player;
  mediaId;

  constructor() {
    super();
  }

  initMediaId(mediaId) {
    this.mediaId = mediaId;
  }

  initPlayer(player) {
    this.player = player;
  }
}
