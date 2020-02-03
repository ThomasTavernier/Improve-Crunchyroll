chromeStorage.chromeStorageInit = () => {
    chromeStorage.VIDEO_PLAYER_ATTRIBUTES.forEach((attribute) => {
        document.documentElement.setAttribute('cbp_' + attribute, chromeStorage[attribute]);
    });
};