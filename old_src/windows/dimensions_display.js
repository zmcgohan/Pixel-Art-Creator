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

	function selectWidthText() {

	}
	function selectHeightText() {

	}

	// TODO change dimension texts into TWO spans -- no worries about backspacing the x or anything at that point
	/*
	// handles initial focus on dimensions text display
	this.dimensionsDisplayText.addEventListener('focus', (function(event) {
		event.preventDefault();
		var curSelection = window.getSelection(),
			curRange = curSelection.getRangeAt(0),
			cursorPos = curSelection.anchorOffset,
			charXPos = this.dimensionsDisplayText.innerHTML.indexOf('x'),
			newRange = document.createRange();
		console.log(curSelection);
		console.log(this.dimensionsDisplayText.childNodes[0]);
		if(cursorPos <= charXPos) {
				newRange.setStart(curSelection.focusNode, 0);
				newRange.setEnd(curSelection.focusNode, charXPos);
		} else {
				newRange.setStart(curSelection.focusNode, charXPos+1);
				newRange.setEnd(curSelection.focusNode, this.dimensionsDisplayText.innerHTML.length);
		}
		curSelection.removeAllRanges();
		curSelection.addRange(newRange);
	}).bind(this), false);
	*/

	// handles key presses in dimension display's text
	this.dimensionsDisplayText.addEventListener('keydown', (function(event) {
		var curSelection = window.getSelection(),
			curRange = curSelection.getRangeAt(0),
			cursorPos = curSelection.anchorOffset,
			keyPressed = event.which || event.keyCode,
			charXPos = this.dimensionsDisplayText.innerHTML.indexOf('x');
		if(keyPressed === 8 && ((cursorPos === 0 || cursorPos-1 === charXPos) && curRange.startOffset === curRange.endOffset) // make sure backspace isn't at beginning or before the 'x'
			|| (keyPressed < 48 || keyPressed > 57) && keyPressed !== 8 && keyPressed !== 9 && keyPressed !== 13 && keyPressed !== 37 && keyPressed !== 39) {
			event.preventDefault();
		} else if(keyPressed === 13) { // correct Enter functionality
			event.preventDefault();
			console.log("Enter pressed.");
		} else if(keyPressed === 9) { // tab
			event.preventDefault();
			var newRange = document.createRange();
			if(cursorPos <= charXPos) { // before 'x' -- highlight height
				// if width is empty, put original value back
				if(charXPos === 0) { 
					this.dimensionsDisplayText.innerHTML = grid.curSprite.sprite.width + this.dimensionsDisplayText.innerHTML;
					charXPos += String(grid.curSprite.sprite.width).length;
				}
				newRange.setStart(curRange.startContainer, charXPos+1);
				newRange.setEnd(curRange.endContainer, this.dimensionsDisplayText.innerHTML.length);
			} else { // ahead of 'x' -- highlight width
				if(charXPos === this.dimensionsDisplayText.innerHTML.length-1) { 
					this.dimensionsDisplayText.innerHTML += grid.curSprite.sprite.height;
				}
				newRange.setStart(curRange.startContainer, 0);
				newRange.setEnd(curRange.endContainer, charXPos);
			}
			curSelection.removeAllRanges();
			curSelection.addRange(newRange);
		}
	}).bind(this), false);

	document.addEventListener('selectionchange', (function(event) {
		var curSelection = window.getSelection(),
			curRange = curSelection.getRangeAt(0),
			cursorPos = curSelection.anchorOffset,
			charXPos = this.dimensionsDisplayText.innerHTML.indexOf('x');
	}).bind(this), false);
}
