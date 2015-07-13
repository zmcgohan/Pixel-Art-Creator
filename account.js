// check if a username is valid (only a-zA-Z)
exports.usernameIsValid = function(username) {
	return /^[a-z0-9]+$/i.test(username);
}

// check if a password is valid (4 <= numChars <= 30)
exports.passwordIsValid = function(password) {
	return (password.length >= 4 && password.length <= 30);
}

// handle a registration request
exports.handleRegistration = function(db, addUserStmt, socket, data) {
		if(data.username === undefined || data.password === undefined) {
			console.log("Invalid parameters passed to handleRegistration()");
			return;
		}
		console.log('Registration request received. (Username: ' + data.username + ')');
		// error checking
		if(!exports.usernameIsValid(data.username)) {
			console.log('\tInvalid username.');
			socket.emit('register', '[ERROR]: Usernames may only contain letters and numbers');
			return false;
		}
		if(!exports.passwordIsValid(data.password)) {
			console.log('\tInvalid password.');
			socket.emit('register', '[ERROR]: Passwords must be 4-30 characters long');
			return false;
		}
		// if username is taken, error -- if not, add to DB
		db.get("SELECT id FROM users WHERE username='" + data.username + "'", function(err, row) {
			if(row !== undefined) {
				console.log('\tUsername already taken.');
				socket.emit('register', '[ERROR]: That username is already taken');
			} else {
				console.log('\tAll checks valid. Sending success...');
				addUserStmt.run(data.username, data.password, Date.now(), Date.now(), 0);
				socket.emit('register', '[SUCCESS]');
			}
		});
}
