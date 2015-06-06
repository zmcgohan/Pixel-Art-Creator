// displays the dimensions of the current sprite
function DimensionsDisplay() {
	this.update = function() {
		if(mainGrid.curSprite !== undefined) {
			this.window.innerHTML = mainGrid.curSprite.sprite.width + 'x' + mainGrid.curSprite.sprite.height;
			if(!this.initialCoordsSet) {
				this.setPosition(window.innerHeight-15-this.window.offsetHeight, 18);
				this.initialCoordsSet = true;
			}
		}
	}

	Window.call(this);
	this.initialCoordsSet = false;
	this.window.style.fontSize = '.8em';
}
DimensionsDisplay.prototype = Object.create(Window.prototype);

