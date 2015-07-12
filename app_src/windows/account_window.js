function AccountWindow() {
	/* LOGIN/REGISTER STUFF */
	this.loginForm = document.getElementById('loginForm');
	this.loginHeader = document.getElementById('loginHeader');
	this.loginSubmitButton = document.getElementById('loginSubmitButton');
	this.usernameInput = document.getElementById('usernameInput');
	this.passwordInput = document.getElementById('passwordInput');
	this.registerLoginLink = document.getElementById('registerLoginLink');
	this.forgotPasswordLink = document.getElementById('forgotPasswordLink');
	
	this.loggingIn = true; // true = logging in; false = registering

	this.addEventListeners();
}

AccountWindow.prototype.addEventListeners = function() {
	/* LOGIN/REGISTER STUFF */
	this.loginForm.onsubmit = (function() {
		console.log('Input form submitted');
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
}
