let css = '';
let fetchCss = async () => {
  for (const cssUrl of [
    ...[
      // components
      'https://www.crunchyroll.com/versioned_assets/css/components/isolated_page_header_footer.b48f855f.css',
      'https://www.crunchyroll.com/versioned_assets/css/components/std_form.e3538482.css',
    ],
    ...[
      // crcommon
      'https://www.crunchyroll.com/versioned_assets/css/crcommon/overlay.97151830.css',
    ],
    ...[
      // view
      'https://www.crunchyroll.com/versioned_assets/css/view/crx_banner.dd7b99e2.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/welcome.1fa7be5a.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/login_or_signup.fed81387.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/subscriptions.4a1c08b7.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/news.f8fc94db.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/newsfeed.b344923a.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/library.800343e1.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/queue.3012b692.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/beta/comics_showview.08a97de5.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/forum.2f771910.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/showforumtopic.bcc528bc.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/search_beta.4a43cd28.css',
      'https://www.crunchyroll.com/versioned_assets/css/view/premium_comparison_new.eb981f62.css',
      ...[
        //beta
        'https://www.crunchyroll.com/versioned_assets/css/view/beta/freetrial.ed02bd77.css',
      ],
    ],
    ...[
      // www
      'https://www.crunchyroll.com/versioned_assets/css/www/application-legacy.afd0380c.css',
      'https://www.crunchyroll.com/versioned_assets/css/www/application.518bb536.css',
      ...[
        // view
        'https://www.crunchyroll.com/versioned_assets/css/www/view/showmedia.4201f524.css',
      ],
    ],
  ]) {
    await fetch(cssUrl)
      .then((response) => response.text())
      .then((data) => (css += data))
      .catch((error) => {
        return console.error(error, cssUrl);
      });
  }
};
await fetchCss();
// html css
css += `#header_menubar_beta .games {background-color: #FFFFFF !important;}#header_menubar_beta .games:hover {background-color: #FFFFFF !important;}#header_menubar_beta #games_button {color: #363136 !important;}#header_menubar_beta #games_button:hover {color: #DF6300 !important;}#header_menubar_beta .store {background-color: #FFFFFF !important;}#header_menubar_beta .store:hover {background-color: #FFFFFF !important;}#header_menubar_beta #store_button {color: #363136 !important;}#header_menubar_beta #store_button:hover {color: #DF6300 !important;}`;
// custom css
css += `
.header-icon,
.header-searchbox-submit > svg {
  fill: #primary-font-75;
  color: #primary-font-75;
}

.header-searchbox::placeholder {
  color: #primary-font-75;
}

.container-shadow {
  box-shadow: 0 1px 1px #tertiary-font;
  -moz-box-shadow: 0 1px 1px #tertiary-font;
  -webkit-box-shadow: 0 1px 1px #tertiary-font;
}

.old-template-body .container-shadow {
  box-shadow: 0 1px 2px #tertiary-font;
  -moz-box-shadow: 0 1px 2px #tertiary-font;
  -webkit-box-shadow: 0 1px 2px #tertiary-font;
}

.container-shadow-dark {
  box-shadow: 0 1px 3px #tertiary-font;
  -moz-box-shadow: 0 1px 3px #tertiary-font;
  -webkit-box-shadow: 0 1px 3px #tertiary-font;
}

#message_box {
  background-color: #primary;
}

#message_box .message-type-warning.message-item {
  color: #primary;
}

input:not([type="radio"]),
select,
textarea {
  background-color: #primary;
  color: #primary-font;
}

.show-all-simulcasts-button,
a.default-button,
input.default-button {
  background: #tertiary;
}

.isolated-page-footer,
.isolated-page-header {
  background-color: #primary;
}

.login-or-signup-page .forms {
  background-color: #secondary;
}

.topbar-nav-sub a {
  background-color: #secondary-font;
}

.queue-label {
  color: #primary-font;
}

.queue-icon {
  fill: #primary-font;
}

main {
  background-color: #secondary;
}

.games span a {
  color: #primary-font;
}

.announcement a,
.cta span a {
  color: #primary;
}

#___gatsby {
  background-color: #secondary;
}

.dropdown-menu a:hover {
  color: #primary-font;
}

.dropdown-menu a:active {
  background-color: #tertiary;
}

.guestbook-smilies-handle {
  background-color: #primary;
}

#guestbook_commentform .submitbtn {
  background-color: #crunchyroll-orange-lightest;
}

.acct-nav h3 {
  color: #primary-font;
}

.acct-nav ul li a {
  color: #secondary-font;
}

.acct-nav ul li a.highlight {
  color: #primary;
}

.acct-nav ul li a:hover {
  color: #primary;
}

.short-desc {
  color: #secondary-font;
}

.series-title.white {
  color: #primary;
}

.availability-notes-high {
  color: #primary;
}
`;

let colors = {};
Object.entries({
  primary: ['fff', 'ffffff', 'ececec', 'f9f9f9', 'f5ffea'],
  secondary: ['f2f2f2', 'f3f3f3', 'eee', 'ddd', 'e8f9df'],
  tertiary: ['e4e4e4', 'e5e5e5', 'd8e4eb', 'eaeaea', 'ebebeb', 'ccc', 'ecebe9', 'd9d9d9', 'dbf5be'],
  'primary-font': ['363231', '000', '333', '363136', '3f3f3f', '2a2a2a'],
  'secondary-font': ['bbb', '888', '3a3a3a', '7b737e', '666', 'f0f0f0'],
  'tertiary-font': ['cfcfcf', '555', '4d4d4d'],
  'primary-font-75': [],

  'crunchyroll-blue': ['0a6da4'],
  'crunchyroll-blue-light': ['0091d1'],
  'crunchyroll-orange': ['df6300'],
  'crunchyroll-orange-light': ['f78c25'],
  'crunchyroll-orange-lightest': ['faaf3f'],
}).forEach(([t, c]) => {
  colors[t] = t;
  c.forEach((d) => (colors[d] = t));
});

function theme(property) {
  let split = property.split('#');
  const name = split.shift();
  split = split.map((color) => {
    let stringEnd;
    const max = Math.min(...[color.indexOf(' '), color.length].filter((i) => i !== -1));
    stringEnd = color.substring(max);
    color = color.substring(0, max);
    const knowColor = colors[color.toLocaleLowerCase()];
    return `${knowColor ? `var(--${knowColor})` : `#${color}`}${stringEnd}`;
  });
  const properties = split.join(' ');
  if (properties.includes('var(--')) {
    return `${name} ${properties}`;
  }
}

function parse(css) {
  let outputCSS = '';
  let cssByProperty = {};
  css
    .replace(/[\r\n]|    |!important/g, '')
    .split('}')
    .forEach((balise) => {
      if (balise.length > 0 && !balise.includes('@media')) {
        const [selector, text] = balise.split('{');
        text.split(';').forEach((string) => {
          if (string.includes('#')) {
            if (
              ['border-top', 'border-right', 'border-bottom', 'border-left', 'border'].find((boderSelector) =>
                string.includes(boderSelector),
              )
            ) {
              string = `border-color:#${string.match(/(?<=#)[0-9a-zA-Z]+/)[0]}`;
            }
            if (
              string.includes('background:') &&
              !['gradient', 'box-shadow'].find((selector) => string.includes(selector))
            ) {
              string = `background-color: #${string.match(/(?<=#)[0-9a-zA-Z]+/)[0]}`;
            }
            cssByProperty[string] = [
              ...new Set(
                cssByProperty[string] !== undefined
                  ? [...cssByProperty[string], ...selector.split(',')]
                  : selector.split(','),
              ),
            ];
          }
        });
      }
    });
  Object.entries(cssByProperty).forEach(([property, selectors]) => {
    property = theme(property);
    if (property)
      outputCSS += `html[ic_theme]:not([ic_theme="0"]) ${selectors.join(
        ',\nhtml[ic_theme]:not([ic_theme="0"]) ',
      )} {\n    ${property} !important;\n}\n\n`;
  });
  return outputCSS;
}

parse(css);
