class Empty {
  toDestroy = [];

  get attributes() {
    return [];
  }

  destroy() {
    this.toDestroy.forEach((toDestroy) => toDestroy());
  }

  onDestroy(callback) {
    this.toDestroy.push(callback);
  }
}
