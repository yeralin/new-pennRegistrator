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