var SITE_PORT = 80,
	SERVER_PORT = 3000;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// set up static file stuff
app.use('/', express.static('app_src'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/app_src/pixel_art.html');
});

// listen for static app site
http.listen(SITE_PORT, function() {
	console.log('Listening for static site requests on port ' + SITE_PORT);
});

// listen for server requests
var totalSockets = 0;
http.listen(SERVER_PORT, function() {
	console.log('Listening for socket.io server requests on port ' + SERVER_PORT);
});
io.on('connection', function(socket) {
	console.log('Socket connection established. (' + (++totalSockets) + ' total)');
	socket.on('disconnect', function() {
		console.log('Socket disconnected. (' + (--totalSockets) + ' remain)');
	});
	socket.on('login', function(data) {
		console.log('Login request received. (Data: ' + data + ')');
	});
	socket.on('register', function(data) {
		console.log('Register request received. (Data: ' + data + ')');
	});
});
