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
        console.log(message);
        this.stop();
        var message = "Disconnected from email server";
        constructLog(message, "mail");
        console.log(message);
        constructLog("Tests passed", "email");
        callback();
    });

    mailListener.on("error", function(err) {
        constructLog(err, "mail");
        console.log(err);
        buttonState("restore");
        constructLog("Email test failed, check you email credentials", "mail");
    });
};

var testPennStateAccount = function(callback) {
    vo(function * () {
        constructLog("Started PSU Auth testing...", "general");
        var nightmare = Nightmare({
            show: false
        });
        var link = yield nightmare
            .goto('https://webaccess.psu.edu/')
            .type('#login', psuid)
            .type('#password', psupass)
            .click('input[type="submit"]')
            .wait("#alert")
            .exists("#access-links-logout");

        if (link) {
            constructLog("Successfully logged in", "PSU Auth")
            constructLog("Tests passed", "PSU Auth")
            yield nightmare.end();
            callback();

        } else {
            buttonState("restore");
            constructLog("Account test failed, check you Penn State Accound credentials.", "PSU Auth");
            constructLog("Taking screenshoot...", "PSU Auth")
            yield nightmare.screenshot("error " + Date() + ".png");
            constructLog("Screenshoot is in the program's folder", "PSU Auth");
            yield nightmare.end();
        }

        return link;
    })(function(err, result) {
        if (err) return console.log(err);
        
    });

};