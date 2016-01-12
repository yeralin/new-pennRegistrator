var testMailConnection = function(callback) {
    constructLog("Started email testing...", "general");

    var mailListener = new MailListener({
        username: email + "@mail.com",
        password: pass,
        host: "imap.mail.com",
        port: 993, // imap port
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false
        },
        mailbox: "INBOX", // mailbox to monitor
        searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
        markSeen: true, // all fetched email willbe marked as seen and not fetched next time
        fetchUnreadOnStart: true,
        keepalive: {
            interval: 3000
        }
    });

    mailListener.start(); // start listening

    mailListener.on("server:connected", function() {
        var message = "Connected to email server";
        constructLog(message, "mail");

        this.stop();
        var message = "Disconnected from email server";
        constructLog(message, "mail");

        constructLog("Tests passed", "email");
        callback();
    });

    mailListener.on("error", function(err) {
        constructLog(err, "mail");

        buttonState("restore");
        constructLog("Email test failed, check you email credentials", "mail");
    });
};

var testPennStateAccount = function(callback) {
    var state = 1;
    var win = new BrowserWindow({
        show: false
    });
    win.on('closed', function() {
        win = null;
    });

    win.webContents.session.cookies.remove("https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration", "pageKey",
        function(error) {
            if (error) throw error;
        });
    win.webContents.session.cookies.remove("https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration", "sessionKey",
        function(error) {
            if (error) throw error;
        });
    constructLog("Started PSU Auth testing...", "general");
    win.loadUrl('https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration');
    win.webContents.on('did-finish-load', function() {
        if (win.webContents.getTitle() == "Penn State WebAccess Secure Login: Authentication Required") {
            constructLog("Account test failed", "PSU Auth");
            constructLog("Wrong PSU Login/Password", "PSU Auth");
            win.show();
            buttonState("restore");
            return;
        } else if (win.webContents.getTitle() != "Re-enter Password to Continue" && state == 3) {
            constructLog("Account test failed", "PSU Auth");
            constructLog("Wrong Semester number", "PSU Auth");
            win.show();
            buttonState("restore");
            return;
        }
        switch (state) {
            case 1:

                win.webContents.executeJavaScript("document.querySelector('#login').value = '" + psuid + "';");
                win.webContents.executeJavaScript("document.querySelector('#password').value = '" + psupass + "';");
                win.webContents.executeJavaScript("document.querySelector('input[type=\"submit\"]').click()");
                state++;
                break;
            case 2:

                win.webContents.executeJavaScript("document.querySelector('input[id=\"radio1 @ " + semester + "\"]').click()");
                win.webContents.executeJavaScript("document.querySelector('input[type=\"SUBMIT\"]').click()");
                state++;
                break;
            case 3:
                win.show();
                constructLog("Successfully logged in", "PSU Auth")
                constructLog("Tests passed", "PSU Auth")
                win.close();
                callback();
                break;
            default:
                break;
        }
    });


};
