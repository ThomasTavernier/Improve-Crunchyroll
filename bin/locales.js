const fs = require('fs');

const read = (locale) => require(`../_locales/${locale}/messages.json`);
const write = (locale, data) =>
  fs.writeFileSync(
    `${__dirname}/../_locales/${locale}/messages.json`,
    JSON.stringify(
      Object.fromEntries(
        Object.entries(data).sort(([a], [b]) => {
          if (a.startsWith('ext') && !b.startsWith('ext')) {
            return 1;
          } else if (b.startsWith('ext')) {
            return 0;
          }
          return a.localeCompare(b);
        }),
      ),
      null,
      2,
    ),
  );
const en = read('en');
write('en', en);
['es', 'fr', 'pt_BR'].forEach((locale) => {
  const data = read(locale);
  write(locale, Object.fromEntries(Object.entries(en).map(([key, value]) => [key, data[key] || value])));
});
