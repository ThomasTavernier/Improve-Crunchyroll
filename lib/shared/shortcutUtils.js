class ShortcutUtils {
  static delimiter = '||';

  static eventToKey(event) {
    const key = ['ctrl', 'alt', 'shift'].filter((key) => event[`${key}Key`]);
    if (!['Control', 'Alt', 'Shift'].includes(event.key)) {
      key.push(event.code.replace('Numpad', ''));
    }
    return key.join(ShortcutUtils.delimiter);
  }

  static renderKey(key) {
    return (
      key &&
      key.split(ShortcutUtils.delimiter).map((value) => {
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
            return value.replace('Key', '');
        }
      })
    );
  }

  static renderKeyJoinByPlus(key) {
    const rendered = ShortcutUtils.renderKey(key);
    return rendered && rendered.join(' + ');
  }
}
