core.nav = {
  nav: [],

  goTo(location, replace) {
    if (replace) {
      this.nav.pop();
    }
    this.nav.push(location);
    this.change();
    if (document.getElementById('content').children.length >= 2) {
      document.querySelector('#content>main:last-child').open();
    }
  },

  goBack() {
    if (this.nav.length >= 2) {
      this.nav.pop();
      this.change();
      if (document.getElementById('content').children.length >= 2) {
        document.querySelector('#content>main:nth-last-child(2)').close();
      }
    }
  },

  change() {
    const index = this.nav.length - 1;
    const current = this.nav[index];
    const header = document.getElementById('header');
    if (index >= 1) {
      header.classList.remove('home');
    } else {
      header.classList.add('home');
    }
    header.querySelector('h3').textContent = Renderer.translate(current.label);
    core.renderAndAppend(document.getElementById('content'), current);
  },
};
