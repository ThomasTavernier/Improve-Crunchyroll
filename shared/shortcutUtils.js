const shortcutUtils = {
  delimiter: '||',
  eventToKey: (event) => {
    const key = ['ctrl', 'alt', 'shift'].filter((key) => event[`${key}Key`]);
    if (!['Control', 'Alt', 'Shift'].includes(event.key)) {
      key.push(event.key);
    }
    return key.join(shortcutUtils.delimiter);
  },
  renderKey: (key) => {
    return key.split(shortcutUtils.delimiter).map((value) => {
      switch (value) {
        case ' ':
          return '\u2423';
        case 'ArrowLeft':
          return '\u2190';
        case 'ArrowUp':
          return '\u2191';
        case 'ArrowRight':
          return '\u2192';
        case 'ArrowDown':
          return '\u2193';
        default:
          if (value.match(/^[a-z]$/)) {
            return value.toUpperCase();
          }
          return value;
      }
    });
  },
};
