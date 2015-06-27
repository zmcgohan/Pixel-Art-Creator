// displays the dimensions of the current sprite

var DIMENSIONS_DISPLAY_DIV_ID = 'dimensionsDisplay';
	DIMENSIONS_DISPLAY_WIDTH_TEXT_ID = 'dimensionsDisplayWidthText',
	DIMENSIONS_DISPLAY_HEIGHT_TEXT_ID = 'dimensionsDisplayHeightText',
	DIMENSIONS_LOCKED_IMAGE_ID = 'dimensionsLockedImage';

var DIMENSIONS_LOCKED_IMAGE = 'icons/locked.png',
	DIMENSIONS_UNLOCKED_IMAGE = 'icons/unlocked.png';

function DimensionsDisplay() {
	Window.call(this);

	this.dimensionsDisplayDiv = document.getElementById(DIMENSIONS_DISPLAY_DIV_ID);
	this.dimensionsDisplayWidthText = document.getElementById(DIMENSIONS_DISPLAY_WIDTH_TEXT_ID);
	this.dimensionsDisplayHeightText = document.getElementById(DIMENSIONS_DISPLAY_HEIGHT_TEXT_ID);
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
		this.dimensionsDisplayWidthText.innerHTML = String(grid.curSprite.sprite.width);
		this.dimensionsDisplayHeightText.innerHTML = String(grid.curSprite.sprite.height);
		// set the correct lock image
		this.dimensionsLockedImage.src = !grid.curSprite.sprite.dimensionsLocked ? DIMENSIONS_UNLOCKED_IMAGE : DIMENSIONS_LOCKED_IMAGE;
	} else {
		if(this.dimensionsDisplayDiv.style.display !== 'none') {
			this.dimensionsDisplayDiv.style.display = 'none';
		}
	}
}

DimensionsDisplay.prototype.addEventListeners = function() {
	// dimensions locked button functionality -- lock/unlock the current sprite
	this.dimensionsLockedImage.addEventListener('mouseup', (function(event) {
		grid.curSprite.sprite.dimensionsLocked = !grid.curSprite.sprite.dimensionsLocked ? true : false;
		if(!grid.curSprite.sprite.dimensionsLocked) {
			// if unlocking, trim size if necessary
			var changedDimensions = grid.curSprite.sprite.trimSize();
			// move grid's view pos if needed so the sprite stays in same position on canvas
			if(changedDimensions.left || changedDimensions.right || changedDimensions.top || changedDimensions.bottom) {
				grid.curSprite.pos.x += changedDimensions.left;
				grid.curSprite.pos.y += changedDimensions.top;
				grid.render();
			}
			if(grid.curSprite.sprite.width === 0 || grid.curSprite.sprite.height === 0) {
				grid.sprites.splice(grid.sprites.indexOf(grid.curSprite));
				grid.curSprite = undefined;
			}
		}
		this.update();
	}).bind(this), false);

	// highlights the text inside of textNode
	function highlightText(textNode) {
			var selection = window.getSelection(),
				newRange = document.createRange();
			newRange.selectNodeContents(textNode);
			selection.removeAllRanges();
			selection.addRange(newRange);
	}

	// removes any current ranges (highlighting and caret position) in the window
	// NOTE: as a side effect, apparently causes blur in Chrome (whoop whoop)
	function removeAllRanges() {
		var selection = window.getSelection();
		selection.removeAllRanges();
	}

	var fixInvalidDimensions = (function() {
		// if width or height are empty or 0, replace with old value
		if(this.dimensionsDisplayWidthText.innerHTML.length === 0 || this.dimensionsDisplayWidthText.innerHTML == '0')
			this.dimensionsDisplayWidthText.innerHTML = String(grid.curSprite.sprite.width);
		if(this.dimensionsDisplayHeightText.innerHTML.length === 0 || this.dimensionsDisplayHeightText.innerHTML == '0')
			this.dimensionsDisplayHeightText.innerHTML = String(grid.curSprite.sprite.height);
		// entered "05" or "005"? parse it
		this.dimensionsDisplayWidthText.innerHTML = parseInt(this.dimensionsDisplayWidthText.innerHTML);
		this.dimensionsDisplayHeightText.innerHTML = parseInt(this.dimensionsDisplayHeightText.innerHTML);
	}).bind(this);

	var BACKSPACE = 8, TAB = 9, ENTER = 13, LEFT_ARROW = 37, RIGHT_ARROW = 39;
	var handleDimensionsKeyPress = (function(event) {
		var keyCode = event.keyCode || event.which;
		if(keyCode === ENTER) {
			// defocus from input
			removeAllRanges();
			document.activeElement.blur();
			event.preventDefault();
			// resize current sprite if necessary
			fixInvalidDimensions();
			var newNumCols = parseInt(this.dimensionsDisplayWidthText.innerHTML, 10),
				newNumRows = parseInt(this.dimensionsDisplayHeightText.innerHTML, 10);
			if(newNumCols !== grid.curSprite.sprite.width || newNumRows !== grid.curSprite.sprite.height)
				grid.curSprite.sprite.resize(newNumRows, newNumCols);
		} else if(keyCode === TAB) {
			// TODO when backspaced in Firefox, displays NaN
			event.preventDefault();
			fixInvalidDimensions(); // make sure width/height are valid upon change
			if(event.target.id === DIMENSIONS_DISPLAY_WIDTH_TEXT_ID) { // currently in width text
				// focus and highlight height
				this.dimensionsDisplayHeightText.focus();
				highlightText(this.dimensionsDisplayHeightText.childNodes[0]);
			} else { // currently in height text
				// focus and highlight width
				this.dimensionsDisplayWidthText.focus();
				highlightText(this.dimensionsDisplayWidthText.childNodes[0]);
			}
		} else if((keyCode < 48 || keyCode > 57) && keyCode != LEFT_ARROW && keyCode != RIGHT_ARROW && keyCode != BACKSPACE) { // all other keys
			event.preventDefault();
		}
	}).bind(this);

	this.dimensionsDisplayWidthText.addEventListener('keydown', handleDimensionsKeyPress, false);
	this.dimensionsDisplayHeightText.addEventListener('keydown', handleDimensionsKeyPress, false);

	// highlight text on first click, don't highlight if already focused (assumes that focus event fires before click)
	var handleDimensionsDisplayTextFocus = (function(event) {
		this.nodeNeedsHighlighting = event.target.childNodes[0];
	}).bind(this);
	var handleDimensionsDisplayTextClick = (function(event) {
		if(this.nodeNeedsHighlighting) {
			highlightText(this.nodeNeedsHighlighting);
			delete this.nodeNeedsHighlighting;
		}
		event.preventDefault();
	}).bind(this);
	this.dimensionsDisplayWidthText.addEventListener('focus', handleDimensionsDisplayTextFocus, false);
	this.dimensionsDisplayHeightText.addEventListener('focus', handleDimensionsDisplayTextFocus, false);
	this.dimensionsDisplayWidthText.addEventListener('click', handleDimensionsDisplayTextClick, false);
	this.dimensionsDisplayHeightText.addEventListener('click', handleDimensionsDisplayTextClick, false);
}
