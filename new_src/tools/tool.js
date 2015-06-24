function Tool() {
	this.eventListeners = {};
	this.boundListeners = false;
	this.initListeners();
}

Tool.prototype.initListeners = function() {
	console.log("Initializing Tool listeners.");
}

Tool.prototype.addEventListeners = function() {
	var key;
	// if listeners aren't bound to the object yet, do it
	if(!this.boundListeners) {
		// TODO (possibly later) if event.preventDefault() in every event, might as well add it to each here instead
		for(key in this.eventListeners) {
			this.eventListeners[key].func = this.eventListeners[key].func.bind(this);
		}
		this.boundListeners = true;
	}
	// add all listeners
	for(key in this.eventListeners) {
		this.eventListeners[key].target.addEventListener(key, this.eventListeners[key].func, false);
	}
}

Tool.prototype.removeEventListeners = function() {
	var key;
	// remove all listeners
	for(key in this.eventListeners) {
		this.eventListeners[key].target.removeEventListener(key, this.eventListeners[key].func, false);
	}
}
