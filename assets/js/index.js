var MailListener = require("mail-listener2"),
    Nightmare = require('nightmare'),
    vo = require('vo'),
    courseNum = "",
    psuid = "",
    psupass = "",
    email = "",
    pass = "",
    button = "",
    mailListener;


var startMailListener = function() {

    mailListener = new MailListener({
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
        constructLog("Connected to email server", "mail");
        constructLog("Started listening for courses...", "mail")
        console.log("Connected to email server");
        document.querySelector(".button").removeAttribute('disabled');
        
    });

    mailListener.on("server:disconnected", function() {
        var message = "Disconnected from email server";
        constructLog(message, "mail");
        console.log(message);
    });

    mailListener.on("error", function(err) {
        constructLog(err, "mail");
        console.log(err);
    });

    mailListener.on("mail", function(mail, seqno, attributes) {
        if ((Date.parse(mail.receivedDate) + 300000) > Date.parse(Date()) && mail["subject"] === "Watch List Notice") {
            courseNum = mail["text"].substring(mail["text"].indexOf('(') + 1, mail["text"].indexOf(')'));
            console.log('Found course number: ' + courseNum);
            startRegister();
        }
    });

};

var startRegister = function() {

    vo(function * () {
        constructLog("Found course number " + courseNum + ". Registering...", "register");
        var nightmare = Nightmare({
            show: true
        });
        var elementPresent = function() {
            var confirm = document.querySelector(".confirm");
            var urgent = document.querySelector(".urgent")
            return (confirm ? true : false || urgent ? true : false);
        };
        var link = yield nightmare
        var link = yield nightmare
            .goto('https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration')
            .type('#login', psuid)
            .type('#password', psupass)
            .click('input[type="submit"]')
            .wait("input[id='radio1 @ 2']")
            .click("input[id='radio1 @ 2']")
            .click('input[type="SUBMIT"]')
            .wait("input[type='password']")
            .type("input[type='password']", psupass)
            .click('input[type="SUBMIT"]')
            .wait("input[value='']")
            .type("input[value='']", courseNum)
            .click("input[value='Add course to schedule']")
            .wait(elementPresent)
            .exists(".confirm");

        if (link) {
            constructLog("Successfully scheduled class " + courseNum, "register");
            yield nightmare.end();

        } else {
            constructLog("Class was not registered. Something went wrong, taking screenshoot...", "register");
            yield nightmare.screenshot("error " + Date() + ".png");
            constructLog("Screenshoot is in the program's folder", "register");
            yield nightmare.end();
        }

        return link;
    })(function(err) {
        if (err) return console.log(err);
    });

};

var startListening = function() {
    psuid = document.querySelector("#psuid").value,
    psupass = document.querySelector("#psupass").value,
    email = document.querySelector("#email").value,
    pass = document.querySelector("#pass").value,
    button = document.querySelector(".button");
    if (button.classList.contains("stop")) {
        buttonState("restore");
        mailListener.stop();
        var logWindow = document.querySelector(".logWindow");
        logWindow.innerHTML = "";
    } else {
        if (psuid === "" || psupass === "" || email === "" || pass === "") {
            buttonState("error");
        } else {
            buttonState("stop");
            testMailConnection(function() {
                testPennStateAccount(function() {
                    startMailListener();
                });
            });

        }
    }
};
