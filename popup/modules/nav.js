core.nav = {
    nav: [],

    goTo(location) {
        this.nav.push(location);
        this.change();
        if (document.getElementById('content').children.length >= 2) document.querySelector('#content>main:last-child').open();
    },

    goBack() {
        if (this.nav.length >= 2) {
            this.nav.pop();
            this.change();
            if (document.getElementById('content').children.length >= 2) document.querySelector('#content>main:nth-last-child(2)').close();
        }
    },

    change() {
        let index = this.nav.length - 1;
        let current = this.nav[index];
        let header = document.getElementById('header');
        if (index >= 1) {
            header.classList.remove('home');
        } else {
            header.classList.add('home');
        }
        header.querySelector('h3').innerHTML = core.translate(current.label);
        core.render(document.getElementById('content'), current);
    },
}