// Load native UI library
var gui = require('nw.gui'); //or global.window.nwDispatcher.requireNwGui() (see https://github.com/rogerwang/node-webkit/issues/707)

// Get the current window
var win = gui.Window.get();
document.onreadystatechange = function () {

	document.querySelector(".minimize").addEventListener("click", function(){ win.minimize(); });
	document.querySelector(".close").addEventListener("click", function(){ win.close(); });
}