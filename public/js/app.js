var remote = require('remote');
var BrowserWindow = remote.require('browser-window');

document.onreadystatechange = function () {
   document.querySelector(".minimize").addEventListener("click", function(){
       var window = remote.getCurrentWindow();
       window.minimize(); 
  });

  document.querySelector(".close").addEventListener("click", function(){
       var window = remote.getCurrentWindow();
       window.close();
       app.quit();
  }); 
}

var win = new BrowserWindow({ width: 500, height: 500, show: false });
win.on('closed', function() {
  win = null;
});
var state  = 1;
win.loadUrl('https://elionvw.ais.psu.edu/cgi-bin/elion-student.exe/submit/goRegistration');
win.webContents.on('did-finish-load', function() {
    switch(state){
    	case 1:
    		console.log(win.webContents.getUrl());
    		win.webContents.executeJavaScript("document.querySelector('#login').value = 'dmy139';");
	    	win.webContents.executeJavaScript("document.querySelector('#password').value = '14563258963d';");
	    	win.webContents.executeJavaScript("document.querySelector('input[type=\"submit\"]').click()");
	    	state++;
    		break;
    	case 2:
    		console.log(win.webContents.getUrl());
	    	win.webContents.executeJavaScript("document.querySelector('input[id=\"radio1 @ 2\"]').click()");
	    	win.webContents.executeJavaScript("document.querySelector('input[type=\"SUBMIT\"]').click()");
	    	state ++;
	    	break;
	    case 3:
	    	console.log(win.webContents.getUrl());
			win.webContents.executeJavaScript("document.querySelector('input[type=\"password\"]').value = '14563258963d';");
    		win.webContents.executeJavaScript("document.querySelector('input[type=\"SUBMIT\"]').click()");
    		state ++;
    	default:
    		break;
    }
});
win.show();
var MailListener = require("mail-listener2"),
    Nightmare = require('nightmare'),
    vo = require('vo'),
    courseNum = "",
    psuid = "",
    psupass = "",
    email = "",
    pass = "",
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