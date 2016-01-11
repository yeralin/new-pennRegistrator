var remote = require('remote'),
BrowserWindow = remote.require('browser-window'),
fs = require('fs');

document.onreadystatechange = function() {
    document.querySelector(".minimize").addEventListener("click", function() {
        var window = remote.getCurrentWindow();
        window.minimize();
    });

    document.querySelector(".close").addEventListener("click", function() {
        var window = remote.getCurrentWindow();
        window.close();
        app.quit();
    });
};