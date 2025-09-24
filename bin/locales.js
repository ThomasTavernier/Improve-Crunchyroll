const fs = require('fs');
const path = require('path');

const readLocale = (locale) => {
  try {
    return require(path.join('..', '_locales', locale, 'messages.json'));
  } catch (error) {
    console.error(`Error reading locale ${locale}:`, error.message);
    process.exit(1);
  }
};

const writeLocale = (locale, data) => {
  const localeDir = path.join(__dirname, '..', '_locales', locale);
  const sortedData = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => {
      if (a.startsWith('ext') && !b.startsWith('ext')) return -1;
      if (!a.startsWith('ext') && b.startsWith('ext')) return 1;
      return a.localeCompare(b);
    }),
  );

  try {
    fs.writeFileSync(path.join(localeDir, 'messages.json'), JSON.stringify(sortedData, null, 2) + '\n');
  } catch (error) {
    console.error(`Error writing locale ${locale}:`, error.message);
    process.exit(1);
  }
};

// Main script
(() => {
  const supportedLocales = ['es', 'fr', 'pt_BR', 'de'];
  const en = readLocale('en');

  // Update English locale first
  writeLocale('en', en);
  console.log('Updated English locale');

  // Update other locales
  supportedLocales.forEach((locale) => {
    const data = readLocale(locale);
    const mergedData = Object.fromEntries(Object.entries(en).map(([key, value]) => [key, { ...value, ...data[key] }]));
    writeLocale(locale, mergedData);
    console.log(`Updated ${locale} locale`);
  });
})();
