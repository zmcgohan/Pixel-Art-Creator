var SPRITES_CONTAINER_ID = 'spritesContainer',
	SPRITES_CONTAINER_TITLE_ID = 'spritesContainerTitle',
	SPRITES_MINIMIZED_DIV_ID = 'spritesMinimized';

function SpritesWindow() {
	this.spritesContainer = document.getElementById(SPRITES_CONTAINER_ID);
	this.spritesContainerTitle = document.getElementById(SPRITES_CONTAINER_TITLE_ID);
	this.spritesMinimizedDiv = document.getElementById(SPRITES_MINIMIZED_DIV_ID);

	this.addEventListeners();
}

SpritesWindow.prototype.addEventListeners = function() {
	// open sprites window from minimized 
	this.spritesMinimizedDiv.addEventListener('mouseup', (function(event) {
		this.spritesMinimizedDiv.style.display = 'none'; // hide minimized bar
		this.spritesContainer.style.display = 'block'; // show sprites container
	}).bind(this), false);

	// minimize sprites container on title bar click
	this.spritesContainerTitle.addEventListener('mouseup', (function(event) {
		this.spritesContainer.style.display = 'none'; // hide sprites container
		this.spritesMinimizedDiv.style.display = 'block'; // show sprites minimized div
	}).bind(this), false);
}
