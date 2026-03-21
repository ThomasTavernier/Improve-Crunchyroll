class Parent extends Empty {
  get attributes() {
    return this.children.flatMap((child) => child.attributes);
  }

  children;

  constructor(...children) {
    super();
    this.children = children.map((child) => new child());
  }

  destroy() {
    super.destroy();
    this.children.forEach((child) => {
      child.destroy();
    });
  }
}
