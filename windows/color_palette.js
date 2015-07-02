function ColorPalette() {
	Window.call(this);
	this.window = document.getElementById('colorPalette');
	this.colors = [ curColor, '#fafafa', '#0000FF', '#00FF00', '#00ffff', '#ffff00' ];
	this.updateNeeded = true;
	this.update();
}

ColorPalette.prototype = Object.create(Window.prototype);

ColorPalette.prototype.update = function() {
	if(!this.updateNeeded) return;
	var colorSlidesContainer = document.getElementById('colorSlidesContainer');
	// remove current children
	while(colorSlidesContainer.firstChild) colorSlidesContainer.removeChild(colorSlidesContainer.firstChild);
	var i, newSlide;
	// add each color slide, set its style properties and events
	for(i = 0; i < this.colors.length; ++i) {
		newSlide = document.createElement('div');
		newSlide.className = 'colorSlide';
		newSlide.pixelArtColor = this.colors[i];
		newSlide.style.background = this.colors[i];
		if(curColor === this.colors[i]) {
			newSlide.className += ' curSlide';
		}
		colorSlidesContainer.appendChild(newSlide);
		var slideClickListener = function(event) {
			if(!this.dragged) {
				curColor = event.target.pixelArtColor; 
				this.updateNeeded = true;
				this.update();
			}
		}
		newSlide.addEventListener('click', slideClickListener.bind(this), false);
	}
	var newColorSlideButton = document.getElementById('newColorSlideButton');
	var newColorClickListener = (function(event) {
		if(!this.dragged) {
			if(!colorPicker.visible) {
				colorPicker.show();
			} else {
				colorPicker.hide();
			}
		}
	}).bind(this);
	newColorSlideButton.addEventListener('click', newColorClickListener, false);
	// successfully changed -- don't need to update until next needed
	this.updateNeeded = false;
}
