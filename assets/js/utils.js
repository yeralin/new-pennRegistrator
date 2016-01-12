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
