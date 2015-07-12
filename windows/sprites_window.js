var SPRITES_CONTAINER_ID = 'spritesContainer',
	SPRITES_CONTAINER_TITLE_ID = 'spritesContainerTitle',
	SPRITES_SCROLL_CONTAINER_ID = 'spritesScrollContainer',
	SPRITE_DISPLAYS_CONTAINER_ID = 'spriteDisplaysContainer',
	SPRITES_MINIMIZED_DIV_ID = 'spritesMinimized',
	NEW_SPRITE_BUTTON_ID = 'newSpriteButton';

function SpritesWindow() {
	this.spritesContainer = document.getElementById(SPRITES_CONTAINER_ID);
	this.spritesContainerTitle = document.getElementById(SPRITES_CONTAINER_TITLE_ID);
	this.spritesScrollContainer = document.getElementById(SPRITES_SCROLL_CONTAINER_ID);
	this.spriteDisplaysContainer = document.getElementById(SPRITE_DISPLAYS_CONTAINER_ID);
	this.spritesMinimizedDiv = document.getElementById(SPRITES_MINIMIZED_DIV_ID);
	this.newSpriteButton = document.getElementById(NEW_SPRITE_BUTTON_ID);

	this.spriteDisplays = [];

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

	// new sprite button click (add sprite)
	this.newSpriteButton.addEventListener('mouseup', (function(event) {
		grid.addSprite();
		grid.curSprite = grid.sprites[grid.sprites.length-1];
		updateScreen();
	}).bind(this), false);
}

var SPRITE_DISPLAY_PADDING = .10; // total padding on each side for each sprite
SpritesWindow.prototype.fullUpdate = function() {
	var spriteI, curSprite,
		spriteCtx,
		displayPaddingX, displayPaddingY, pixelWidth, topLeftXDrawPos, topLeftYDrawPos;
	// add sprite displays as needed
	while(this.spriteDisplays.length < grid.sprites.length) this.addSpriteDisplay();
	while(this.spriteDisplays.length > grid.sprites.length) this.removeSpriteDisplay();
	// set current sprite display
	for(spriteI = 0; spriteI < grid.sprites.length; ++spriteI) {
		if(grid.sprites[spriteI].sprite !== grid.curSprite.sprite)
			this.spriteDisplays[spriteI].removeAttribute('id');
		else
			this.spriteDisplays[spriteI].id = 'curSpriteDisplay';
	}
	// render each sprite
	for(spriteI = 0; spriteI < grid.sprites.length; ++spriteI) {
		curSprite = grid.sprites[spriteI].sprite;
		spriteCtx = this.spriteDisplays[spriteI].getContext('2d');
		spriteCtx.clearRect(0, 0, spriteCtx.canvas.width, spriteCtx.canvas.height);
		if(curSprite.width > curSprite.height) {
			displayPaddingX = spriteCtx.canvas.width * SPRITE_DISPLAY_PADDING;
			pixelWidth = (spriteCtx.canvas.width - 2 * displayPaddingX) / curSprite.width;
			displayPaddingY = spriteCtx.canvas.height / 2 - curSprite.height / 2 * pixelWidth;
		} else {
			displayPaddingY = spriteCtx.canvas.height * SPRITE_DISPLAY_PADDING;
			pixelWidth = (spriteCtx.canvas.height - 2 * displayPaddingY) / curSprite.height;
			displayPaddingX = spriteCtx.canvas.width / 2 - curSprite.width / 2 * pixelWidth;
		}
		curSprite.render(spriteCtx, 0, displayPaddingX, displayPaddingY, pixelWidth);
	}
}

SpritesWindow.prototype.getDisplayIndex = function(display) {
	var displayI = 0;
	while(this.spriteDisplays[displayI] !== display) ++displayI;
	return displayI;
}

// handle sprite display click to change current sprite
SpritesWindow.prototype.handleDisplayClick = function(event) {
	var displayI = this.getDisplayIndex(event.target);
	grid.curSprite = grid.sprites[displayI];

	updateScreen();
}

// adds a new sprite display element to list of sprite displays and the scroll container
SpritesWindow.prototype.addSpriteDisplay = function() {
	var newSpriteDisplay = document.createElement('canvas');
	newSpriteDisplay.className = 'spriteDisplay';
	this.spriteDisplaysContainer.appendChild(newSpriteDisplay);
	// set display's dimensions
	newSpriteDisplay.width = parseInt(newSpriteDisplay.offsetWidth * AR);
	newSpriteDisplay.height = parseInt(newSpriteDisplay.offsetHeight * AR);
	this.spriteDisplays.push(newSpriteDisplay);
	// add click listener (to change current sprite)
	newSpriteDisplay.addEventListener('mouseup', this.handleDisplayClick.bind(this), false);
}

// removes a sprite display from list of sprite displays and scroll container
SpritesWindow.prototype.removeSpriteDisplay = function() {
	this.spriteDisplaysContainer.removeChild(this.spriteDisplays[this.spriteDisplays.length-1]);
	this.spriteDisplays.splice(this.spriteDisplays.length-1, 1);
}
