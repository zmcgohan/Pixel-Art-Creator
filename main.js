var SITE_PORT = 80,
	SERVER_PORT = 3000,
	DB_FILE = 'pixel_art.db';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// database set up
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(DB_FILE);
var addUserStmt, findUserStmt;
db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT COLLATE NOCASE, password TEXT, last_used INTEGER, time_registered INTEGER, paid_user INTEGER)");

	addUserStmt = db.prepare("INSERT INTO users (username, password, last_used, time_registered, paid_user) VALUES (?, ?, ?, ?, ?)");
});

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
var account = require('./account.js');
var totalSockets = 0;
http.listen(SERVER_PORT, function() {
	console.log('Listening for socket.io server requests on port ' + SERVER_PORT);
});
io.on('connection', function(socket) {
	console.log('Socket connection established. (' + (++totalSockets) + ' total)');
	socket.on('disconnect', function() {
		console.log('Socket disconnected. (' + (--totalSockets) + ' remain)');
	});
	// user attempting to log in
	socket.on('login', function(data) {
		console.log('Login request received. (Username: ' + data.username + ')');
		db.get("SELECT id FROM users WHERE username='" + data.username + "' AND password='" + data.password + "'", function(err, row) {
			if(row !== undefined) { // login successful
				console.log('\tLogin successful.');
				socket.emit('login', '[SUCCESS]');
			} else {
				console.log('\tNo match found for user/pass.');
				socket.emit('login', '[ERROR]: Invalid username/password');
			}
		});
	});
	// user is registering
	socket.on('register', function(data) {
		account.handleRegistration(db, addUserStmt, socket, data);
	});
	// user is saving their projects
	socket.on('save projects', function(data) {
		console.log('Saving projects: ' + data);
	});
});
