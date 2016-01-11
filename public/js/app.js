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
            win.capturePage(function handleCapture(img) {
                fs.writeFile("./screenshots/error.png", img.toPng(), function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    constructLog("Error screenshot taken, stored in program's folder", "general");
                });
            });
            win.close();
            return;
        }
        if (state === 5) {
            constructLog("Task is done", "register")
           win.capturePage(function handleCapture(img) {
                fs.writeFile("./screenshots/registration.png", img.toPng(), function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    constructLog("Registration screenshot taken, stored in program's folder", "general");
                });
            });
            win.close();
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
    var state = 1;
    var win = new BrowserWindow({
        show: false
    });
    win.on('closed', function() {
        win = null;
    });

    constructLog("Started PSU Auth testing...", "general");
    win.loadUrl('https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration');
    win.webContents.on('did-finish-load', function() {
        if (win.webContents.getTitle() == "Penn State WebAccess Secure Login: Authentication Required") {
            constructLog("Account test failed", "PSU Auth");
            constructLog("Wrong PSU Login/Password", "PSU Auth");
            win.capturePage(function handleCapture(img) {
              fs.writeFile("./error.png", img.toPng(), function(err){
                if(err) {
                        return console.log(err);
                    }
                    constructLog("Error screenshot taken, stored in program's folder", "general");
              });
            });
            buttonState("restore");
            win.close();
            return;
        }
        else if(win.webContents.getTitle() !=  "Re-enter Password to Continue" && state == 3) {
            constructLog("Account test failed", "PSU Auth");
            constructLog("Wrong Semester number", "PSU Auth");
            win.capturePage(function handleCapture(img) {
              fs.writeFile("./screenshots/error.png", img.toPng(), function(err){
                if(err) {
                        return console.log(err);
                    }
                    constructLog("Error screenshot taken, stored in program's folder", "general");
              });
            });
            buttonState("restore");
            win.close();
            return;
        }
        switch (state) {
            case 1:
                console.log(win.webContents.getTitle());
                win.webContents.executeJavaScript("document.querySelector('#login').value = '"+psuid+"';");
                win.webContents.executeJavaScript("document.querySelector('#password').value = '"+psupass+"';");
                win.webContents.executeJavaScript("document.querySelector('input[type=\"submit\"]').click()");
                state++;
                break;
            case 2:
                console.log(win.webContents.getTitle());
                win.webContents.executeJavaScript("document.querySelector('input[id=\"radio1 @ "+semester+"\"]').click()");
                win.webContents.executeJavaScript("document.querySelector('input[type=\"SUBMIT\"]').click()");
                state++;
                break;
            case 3:
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