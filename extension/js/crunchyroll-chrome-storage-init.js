chromeStorage.chromeStorageInit = () => {
    chromeStorage.ATTRIBUTES.forEach((attribute) => {
        document.documentElement.setAttribute('cbp_' + attribute, chromeStorage[attribute]);
    });
};