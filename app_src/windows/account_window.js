function AccountWindow() {
	/* LOGIN/REGISTER STUFF */
	this.loginMenu = document.getElementById('loginMenu');
	this.loginForm = document.getElementById('loginForm');
	this.loginHeader = document.getElementById('loginHeader');
	this.loginSubmitButton = document.getElementById('loginSubmitButton');
	this.usernameInput = document.getElementById('usernameInput');
	this.passwordInput = document.getElementById('passwordInput');
	this.registerLoginLink = document.getElementById('registerLoginLink');
	this.forgotPasswordLink = document.getElementById('forgotPasswordLink');
	this.loginErrorContainer = document.getElementById('loginErrorContainer');
	this.loginRememberCheck = document.getElementById('loginRememberCheck');

	this.accountLoadingImage = document.getElementById('accountLoadingImage');

	/* LOGGED IN MENU */
	this.loggedInMenu = document.getElementById('loggedInMenu');
	this.loggedInText = document.getElementById('loggedInText');
	this.logoutText = document.getElementById('logoutText');
	
	this.loggingIn = true; // true = logging in; false = registering

	this.addEventListeners();
}

AccountWindow.prototype.addEventListeners = function() {
	/* LOGIN/REGISTER STUFF */
	socket.on('register', (function(data) {
		if(data.indexOf('[SUCCESS]') > -1) {
			curUser = {
				username: this.usernameInput.value, // TODO change
				verification: undefined
			};
			this.update();
			// clear form stuff
			this.resetForms();
		} else {
			this.setError(data);
		}
	}).bind(this));
	socket.on('login', (function(data) {
		if(data.indexOf('[SUCCESS]') > -1) {
			curUser = {
				username: this.usernameInput.value, // TODO change
				verification: undefined
			};
			// if "Remember Me" box is checked, create cookie
			if(this.loginRememberCheck.checked) {
				var d = new Date();
				d.setTime(d.getTime() + 365*24*60*60*1000); // cookie lasts for a year
				document.cookie = 'pxUser=' + curUser.username + '; expires=' + d.toUTCString();
			}
			this.update();
			// clear form stuff
			this.resetForms();
		} else {
			this.setError(data);
		}
	}).bind(this));
	this.loginForm.onsubmit = (function(event) {
		var data = {
			username: this.usernameInput.value,
			password: this.passwordInput.value
		};
		if(this.loggingIn) {
			socket.emit('login', data);
		} else {
			socket.emit('register', data);
		}
		event.preventDefault();
		return false;
	}).bind(this);

	// register/log in link
	this.registerLoginLink.onmouseup = (function() {
		this.loggingIn = !this.loggingIn;
		if(this.loggingIn) {
			this.registerLoginLink.innerText = 'Register';
			this.loginHeader.innerText = 'Log In';
		} else {
			this.registerLoginLink.innerText = 'Log In';
			this.loginHeader.innerText = 'Register';
		}
	}).bind(this);

	// logout
	this.logoutText.onmouseup = (function() {
		curUser = undefined;
		this.update();
	}).bind(this);
}

/* Resets the login and register forms to their initial values. */
AccountWindow.prototype.resetForms = function() {
	this.usernameInput.value = '';
	this.passwordInput.value = '';
	this.setError('');
	this.loginRememberCheck.checked = false;
}

AccountWindow.prototype.setError = function(errorMsg) {
	var prefix = '[ERROR]: ';
	this.loginErrorContainer.innerText = errorMsg.substring(prefix.length);
}

AccountWindow.prototype.update = function() {
	if(curUser) {
		this.loginMenu.style.display = 'none';
		this.loggedInMenu.style.display = 'block';
		this.loggedInText.innerText = 'You are logged in as ' + curUser.username;
	} else {
		this.loginMenu.style.display = 'block';
		this.loggedInMenu.style.display = 'none';
	}
}
