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
var MailListener = require("mail-listener2"),
    courseNum = "",
    psuid = "",
    psupass = "",
    email = "",
    pass = "",
    semester = "",
    button = "",
    mailListener = "",
    dropOption = "",
    startTime,
    timeout;


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
        document.querySelector(".button").removeAttribute('disabled');

    });

    mailListener.on("server:disconnected", function() {
        var message = "Disconnected from email server";
        constructLog(message, "mail");

    });

    mailListener.on("error", function(err) {
        constructLog(err, "mail");

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
    win.loadUrl('https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration');
    win.webContents.session.clearCache(function() {
        win.webContents.session.clearStorageData(function() {
            win.webContents.on('did-finish-load', function() {
                if (win.webContents.getTitle() == "Penn State WebAccess Secure Login: Authentication Required") {
                    constructLog("Wrong PSU Login/Password", "PSU Auth");
                    win.show();
                    return;
                }
                if (state === 5) {
                    if(dropOption){
                        win.webContents.executeJavaScript("document.querySelector('input[value=\"N\"]').click()");
                        win.webContents.executeJavaScript("document.querySelector('input[type=\"SUBMIT\"]').click()");
                        constructLog("Task is done", "register")
                        win.show();
                        return;
                    }
                    constructLog("Task is done", "register")
                    win.show();
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

                        win.webContents.executeJavaScript("document.querySelector('input[type=\"password\"]').value = '" + psupass + "';");
                        win.webContents.executeJavaScript("document.querySelector('input[type=\"SUBMIT\"]').click()");
                        state++;
                        break;
                    case 4:

                        win.webContents.executeJavaScript("document.querySelector('input[value=\"\"]').value = '" + courseNum + "';");
                        win.webContents.executeJavaScript("document.querySelector('input[value=\"Add course to schedule\"]').click()");
                        state++;
                        break;
                    default:
                        break;
                }
            });
        });
    });

};

var startListening = function() {

    psuid = document.querySelector("#psuid").value,
        psupass = document.querySelector("#psupass").value,
        email = document.querySelector("#email").value,
        pass = document.querySelector("#pass").value,
        button = document.querySelector(".button"),
        dropOption = document.querySelector("#drop").checked;
    var logWindow = document.querySelector(".logWindow");
    logWindow.innerHTML = "";
    if (document.querySelector('input[name="semester"]:checked') != null) {
        semester = document.querySelector('input[name="semester"]:checked').value;
    }
    if (button.classList.contains("stop")) {
        buttonState("restore");
        mailListener.stop();
    } else {
        if (psuid === "" || psupass === "" || email === "" || pass === "" || semester === "") {
            buttonState("error");
        } else {
            buttonState("stop");
            startTime = new Date();
            timeout = setTimeout(display, 1000);
            testMailConnection(function() {
                testPennStateAccount(function() {
                    startMailListener();
                });
            });

        }
    }
};

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

    win.webContents.session.clearCache(function() {
        win.webContents.session.clearStorageData(function() {
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
        });
    });


};

function searchKeyPress(e) {
    // look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13) {
        document.querySelector(".button").click();
        return false;
    }
    return true;
}

var constructLog = function(message, module) {
    var element = "<p> >  " + "Module " + module + ": " + message + " </p>";
    var logWindow = document.querySelector(".logWindow");
    logWindow.innerHTML = logWindow.innerHTML + element;
    logWindow.scrollTop = logWindow.scrollHeight;
};

var buttonState = function(state){
    button = document.querySelector(".button");
    clearTimeout(timeout);
    document.querySelector(".time").innerHTML = "0 days, 0:0:0";
    if(state === "error"){
        button.classList.add('error');
            button.setAttribute('disabled', 'disabled');
            button.setAttribute('data-label', 'Error');
            document.querySelector(".error").innerHTML = "Please, fill all forms first";
            setTimeout(function() {
                document.querySelector(".error").innerHTML = "";
                button.classList.remove('error');
                button.removeAttribute('disabled');
                button.setAttribute('data-label', 'Submit');
            }, 1500);
    }
    else if(state === "stop") {
        button.classList.add('stop');
        button.setAttribute('data-label', 'Stop');
        button.setAttribute('disabled', 'disabled');
    }
    else if(state === "restore"){
        button.classList.remove('stop');
        button.classList.remove('error');
        button.removeAttribute('disabled');
        button.setAttribute('data-label', 'Submit');
    }
}

var display = function() {
    // later record end time
    var endTime = new Date();

    // time difference in ms
    var timeDiff = endTime - startTime;

    // strip the miliseconds
    timeDiff /= 1000;

    // get seconds
    var seconds = Math.round(timeDiff % 60);

    // remove seconds from the date
    timeDiff = Math.floor(timeDiff / 60);

    // get minutes
    var minutes = Math.round(timeDiff % 60);

    // remove minutes from the date
    timeDiff = Math.floor(timeDiff / 60);

    // get hours
    var hours = Math.round(timeDiff % 24);

    // remove hours from the date
    timeDiff = Math.floor(timeDiff / 24);

    // the rest of timeDiff is number of days
    var days = timeDiff;

    document.querySelector(".time").innerHTML = days + " days, " + hours + ":" + minutes + ":" + seconds;
    timeout = setTimeout(display, 1000);
}
