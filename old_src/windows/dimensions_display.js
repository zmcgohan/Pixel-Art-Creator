// displays the dimensions of the current sprite

var DIMENSIONS_DISPLAY_DIV_ID = 'dimensionsDisplay';
	DIMENSIONS_DISPLAY_TEXT_ID = 'dimensionsDisplayText',
	DIMENSIONS_LOCKED_IMAGE_ID = 'dimensionsLockedImage';

var DIMENSIONS_LOCKED_IMAGE = 'icons/locked.png',
	DIMENSIONS_UNLOCKED_IMAGE = 'icons/unlocked.png';

function DimensionsDisplay() {
	Window.call(this);

	this.dimensionsDisplayDiv = document.getElementById(DIMENSIONS_DISPLAY_DIV_ID);
	this.dimensionsDisplayText = document.getElementById(DIMENSIONS_DISPLAY_TEXT_ID);
	this.dimensionsLockedImage = document.getElementById(DIMENSIONS_LOCKED_IMAGE_ID);

	this.addEventListeners();
}
DimensionsDisplay.prototype = Object.create(Window.prototype);

DimensionsDisplay.prototype.update = function() {
	if(grid.curSprite !== undefined) {
		// make sure dimensions display isn't hidden
		if(this.dimensionsDisplayDiv.style.display !== 'block') {
			this.dimensionsDisplayDiv.style.display = 'block';
		}
		// show dimensions text (ex. '8x8')
		this.dimensionsDisplayText.innerHTML = grid.curSprite.sprite.width + 'x' + grid.curSprite.sprite.height;
		// set the correct lock image
		this.dimensionsLockedImage.src = !grid.curSprite.sprite.dimensionsLocked ? DIMENSIONS_UNLOCKED_IMAGE : DIMENSIONS_LOCKED_IMAGE;
	} else {
		if(this.dimensionsDisplayDiv.style.display !== 'none') {
			this.dimensionsDisplayDiv.style.display = 'none';
		}
	}
}

DimensionsDisplay.prototype.addEventListeners = function() {
	this.dimensionsLockedImage.addEventListener('mouseup', (function(event) {
		grid.curSprite.sprite.dimensionsLocked = !grid.curSprite.sprite.dimensionsLocked ? true : false;
		this.update();
	}).bind(this), false);
}
