var MailListener = require("mail-listener2"),
    courseNum = "",
    psuid = "",
    psupass = "",
    email = "",
    pass = "",
    semester = "",
    button = "",
    mailListener = "";


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
            startRegister();
        }
    });

};

var startRegister = function() {
    var state = 1;
    var win = new BrowserWindow({
        width: 1600,
        height: 900,
        show: false
    });
    win.on('closed', function() {
        win = null;
    });

    constructLog("Found course number: " + courseNum, "register");
    constructLog("Registration started...", "register");
    win.webContents.session.cookies.remove({
            url: "https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration",
            name: "pageKey"
        },
        function(error) {
            if (error) throw error;
        });
    win.webContents.session.cookies.remove({
            url: "https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration",
            name: "sessionKey"
        },
        function(error) {
            if (error) throw error;
        });
    win.loadUrl('https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration');
    win.webContents.on('did-finish-load', function() {
        if (win.webContents.getTitle() == "Penn State WebAccess Secure Login: Authentication Required") {
            constructLog("Wrong PSU Login/Password", "PSU Auth");
            win.show();
            return;
        }
        if (state === 5) {
            constructLog("Task is done", "register")
            win.show();
            return;
        }
        switch (state) {
            case 1:
                console.log(win.webContents.getTitle());
                win.webContents.executeJavaScript("document.querySelector('#login').value = '" + psuid + "';");
                win.webContents.executeJavaScript("document.querySelector('#password').value = '" + psupass + "';");
                win.webContents.executeJavaScript("document.querySelector('input[type=\"submit\"]').click()");
                state++;
                break;
            case 2:
                console.log(win.webContents.getTitle());
                win.webContents.executeJavaScript("document.querySelector('input[id=\"radio1 @ " + semester + "\"]').click()");
                win.webContents.executeJavaScript("document.querySelector('input[type=\"SUBMIT\"]').click()");
                state++;
                break;
            case 3:
                console.log(win.webContents.getTitle());
                win.webContents.executeJavaScript("document.querySelector('input[type=\"password\"]').value = '" + psupass + "';");
                win.webContents.executeJavaScript("document.querySelector('input[type=\"SUBMIT\"]').click()");
                state++;
                break;
            case 4:
                console.log(win.webContents.getTitle());
                win.webContents.executeJavaScript("document.querySelector('input[value=\"\"]').value = '" + courseNum + "';");
                win.webContents.executeJavaScript("document.querySelector('input[value=\"Add course to schedule\"]').click()");
                state++;
                break;
            default:
                break;
        }
    });

};

var startListening = function() {

    psuid = document.querySelector("#psuid").value,
        psupass = document.querySelector("#psupass").value,
        email = document.querySelector("#email").value,
        pass = document.querySelector("#pass").value,
        button = document.querySelector(".button");
    if (document.querySelector('input[name="semester"]:checked') != null) {
        semester = document.querySelector('input[name="semester"]:checked').value;
    }
    if (button.classList.contains("stop")) {
        buttonState("restore");
        mailListener.stop();
        var logWindow = document.querySelector(".logWindow");
        logWindow.innerHTML = "";
    } else {
        if (psuid === "" || psupass === "" || email === "" || pass === "" || semester === "") {
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
