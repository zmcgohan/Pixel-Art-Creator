function Window() {
	this.window = document.createElement('div');
	document.body.appendChild(this.window);
	// drag support -- ondrag is.. iffy at best
	this.mouseDown = false;
	this.lastMousePos = { x: undefined, y: undefined };
	this.dragged = false;
	this.mouseDownListener = function(event) {
		if(event.target === this.window || event.target.parentNode === this.window) {
			this.mouseDown = true;
			this.lastMousePos = { x: event.x, y: event.y };
			this.dragged = false;
		}
	}
	window.addEventListener('mousedown', this.mouseDownListener.bind(this), false);
	this.mouseUpListener = function(event) {
		this.mouseDown = false;
	}
	window.addEventListener('mouseup', this.mouseUpListener.bind(this), false);
	this.mouseMoveListener = function(event) {
		if(this.mouseDown) {
			var newLeft = parseInt(this.window.style.left, 10) + (event.x - this.lastMousePos.x),
				newTop = parseInt(this.window.style.top, 10) + (event.y - this.lastMousePos.y);
			this.setPosition(newTop, newLeft);
			this.lastMousePos = { x: event.x, y: event.y };
			this.dragged = true;
		}
	}
	window.addEventListener('mousemove', this.mouseMoveListener.bind(this), false);
}
Window.prototype = {
	resize: function(width, height) {
		this.window.style.width = width + 'px';
		this.window.style.height = height + 'px';
	},
	
	setPosition: function(top, left) {
		// make sure window doesn't go outside viewable area
		if(top < 5) top = 5;
		else if(top + this.window.offsetHeight > window.innerHeight - 5) top = window.innerHeight - 5 - this.window.offsetHeight;
		if(left < 5) left = 5;
		else if(left + this.window.offsetWidth > window.innerWidth - 5) left = window.innerWidth - 5 - this.window.offsetWidth;
		// set new top and left positions
		this.window.style.top = top + 'px';
		this.window.style.left = left + 'px';
	}
};
