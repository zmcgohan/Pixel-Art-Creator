var ANIMATION_SLIDES_CONTAINER_ID = 'animationSlidesContainer',
	ANIMATION_DISPLAY_ID = 'animationDisplay',
	ANIMATION_SLIDE_CLASS = 'animationSlide',
	NEW_ANIMATION_SLIDE_BUTTON_ID = 'newAnimationSlideButton',
	ANIMATION_PLAY_BUTTON_ID  = 'animationPlayButton',
	ANIMATION_SPEED_DISPLAY_ID = 'animationSpeedDisplay',
	ANIMATION_SPEED_INPUT_ID = 'animationSpeedInput',
	ANIMATION_ONION_ID = 'animationOnion',
	MAX_FRAME_PADDING = .80, // 80% frame padding at <= MAX_FRAME_PADDING_SIZE
	MAX_FRAME_PADDING_SIZE = 1,
	MIN_FRAME_PADDING = .14, // 10% frame padding at >= MIN_FRAME_PADDING_SIZE
	MIN_FRAME_PADDING_SIZE = 15,
	ANIMATION_MAX_FPS = 30,
	ANIMATION_MIN_FPS = 1;

function AnimationWindow() {
	this.slidesContainer = document.getElementById(ANIMATION_SLIDES_CONTAINER_ID);
	this.animationDisplay = document.getElementById(ANIMATION_DISPLAY_ID);
	this.newAnimationSlideButton = document.getElementById(NEW_ANIMATION_SLIDE_BUTTON_ID);
	this.animationPlayButton = document.getElementById(ANIMATION_PLAY_BUTTON_ID);
	this.animationOnion = document.getElementById(ANIMATION_ONION_ID);
	this.animationSpeedDisplay = document.getElementById(ANIMATION_SPEED_DISPLAY_ID);
	this.animationSpeedInput = document.getElementById(ANIMATION_SPEED_INPUT_ID);
	this.animationSlides = [];

	// set animation display's canvas width/height
	this.animationDisplay.width = this.animationDisplay.offsetWidth * AR;
	this.animationDisplay.height = this.animationDisplay.offsetHeight * AR;
	
	// current frame shown in animation display
	this.curAnimationDisplayFrame = 0;
	// currently playing animation?
	this.playingAnimation = false;
	// onion skinning?
	this.onionSkinning = false;
	// frames per second in animation display
	this.animationFps = 5;
	// last time display window was updated
	this.lastDisplayWindowUpdateTime = Date.now();

	// set initial speed in speed input
	this.animationSpeedInput.innerHTML = String(this.animationFps);

	this.addEventListeners();
}

AnimationWindow.prototype.addEventListeners = function() {
	// prevent default behavior (going back in browser history) from scrolling
	this.slidesContainer.addEventListener('mousewheel', (function(event) {
		var horizontalDelta = event.deltaX || -event.wheelDeltaX;
		// TODO make it so you can't go forward in history either
		if(this.slidesContainer.scrollLeft === 0 && horizontalDelta < 0)
			event.preventDefault();
	}).bind(this), false);

	// add a new slide on button click
	this.newAnimationSlideButton.addEventListener('mouseup', (function(event) {
		if(grid.curSprite) {
			// add frame to current sprite and animation window's list
			grid.curSprite.sprite.addFrame();
			grid.curSprite.sprite.frames[grid.curSprite.sprite.frames.length-1].layers[0].initPixels(grid.curSprite.sprite.height, grid.curSprite.sprite.width);
			// set current frame to new frame
			this.update();
			// scroll as right as possible
			this.slidesContainer.scrollLeft = this.slidesContainer.scrollWidth;
			this.setCurrentFrame(grid.curSprite.sprite.frames.length - 1);
			updateScreen();
		}
	}).bind(this), false);

	// start/pause animation on play button
	this.animationPlayButton.onmouseup = (function(event) {
		if(!this.animationPlaying) {
			this.animationPlayButton.id = 'animationPauseButton';
			this.animationPlaying = true;
			// start animating display
			this.curAnimationDisplayFrame = 0;
			this.updateAnimationDisplay();
		} else {
			// draw the current sprite's current frame back to display
			this.drawFrame();
			// change play/pause button back to play
			this.animationPlayButton.id = 'animationPlayButton';
			this.animationPlaying = false;
		}
	}).bind(this);

	// turn on/off onion skinning
	this.animationOnion.onmouseup = (function(event) {
		if(!this.onionSkinning) {
			this.onionSkinning = true;
		} else {
			this.onionSkinning = false;
		}
		grid.render();
	}).bind(this);

	// animation speed display and input
	function focusOnSpeedInput() { // focuses on input and highlights it
		// return if speed input has no text child nodes
		if(this.animationSpeedInput.childNodes.length === 0) return;
		var selection = window.getSelection(),
			range = document.createRange();
		range.selectNodeContents(this.animationSpeedInput.childNodes[0]);
		selection.removeAllRanges();
		selection.addRange(range);
	}
	function fixSpeedInputErrors() { // makes sure input's value isn't above/below max/min FPS and isn't empty
		if(isNaN(parseInt(this.animationSpeedInput.innerHTML)) || parseInt(this.animationSpeedInput.innerHTML) < ANIMATION_MIN_FPS) this.animationSpeedInput.innerHTML = ANIMATION_MIN_FPS;
		else if(parseInt(this.animationSpeedInput.innerHTML) > ANIMATION_MAX_FPS) this.animationSpeedInput.innerHTML = ANIMATION_MAX_FPS;
	}
	function defocus() { // remove focus from input
		var selection = window.getSelection();
		document.activeElement.blur();
		selection.removeAllRanges();
	}
	var changeSpeedInput = (function(amount) {
		var curContent = this.animationSpeedInput.innerHTML,
			curInt = parseInt(curContent);
		if(isNaN(curInt)) { // empty or not a number -- go to min FPS
			this.animationFps = ANIMATION_MIN_FPS;
			this.animationSpeedInput.innerHTML = ANIMATION_MIN_FPS;
		} else if(curInt + amount >= ANIMATION_MIN_FPS && curInt + amount <= ANIMATION_MAX_FPS) { // add amount to FPS
			this.animationFps = curInt + amount;
			this.animationSpeedInput.innerHTML = curInt + amount;
		}
	}).bind(this);
	// if any part of display is clicked (including 'FPS'), focus on input
	this.animationSpeedDisplay.onclick = (function(event) {
		this.animationSpeedInput.focus();
	}).bind(this);
	// on vertical scroll, change FPS
	this.animationSpeedDisplay.onwheel = (function() {
		var SCROLL_CHANGE_AMOUNT = 10; // total delta Y for each movement
		var totalDeltaY = 0;
		return (function(event) {
			var deltaY = event.deltaY;
			if((deltaY < 0 && totalDeltaY > 0) || (deltaY > 0 && totalDeltaY < 0)) totalDeltaY = 0;
			totalDeltaY += deltaY;
			if(totalDeltaY >= SCROLL_CHANGE_AMOUNT) {
				changeSpeedInput(1);
				totalDeltaY = 0;
			} else if(totalDeltaY <= -SCROLL_CHANGE_AMOUNT) {
			   	changeSpeedInput(-1);
				totalDeltaY = 0;
			}
			defocus();
		}).bind(this);
	}).bind(this)();
	this.animationSpeedInput.onfocus = (function(event) { // on focus
		setTimeout(focusOnSpeedInput, 1);
	}).bind(this);
	this.animationSpeedInput.onblur = (function(event) { // when lose focus
		fixSpeedInputErrors();
	}).bind(this);
	this.animationSpeedInput.onkeydown = (function(event) { // when a key is pressed in input
		var BACKSPACE = 8, TAB = 9, ENTER = 13, LEFT_ARROW = 37, UP_ARROW = 38, RIGHT_ARROW = 39, DOWN_ARROW = 40;
		var keyCode = event.keyCode || event.which;
		if(keyCode === ENTER || keyCode === TAB) { // enter/tab pressed -- validate input and change animation FPS
			event.preventDefault();
			defocus();
			// TODO currently relying on blur event being called -- might not be before processed
			//fixSpeedInputErrors();
			this.animationFps = parseInt(this.animationSpeedInput.innerHTML);
		} else if(keyCode === UP_ARROW || keyCode === DOWN_ARROW) { // up/down arrows -- increase/decrease FPS if content of input is a number
			event.preventDefault();
			if(keyCode === UP_ARROW) changeSpeedInput(1);
			else if(keyCode === DOWN_ARROW) changeSpeedInput(-1);
			focusOnSpeedInput();
		} else if(keyCode === BACKSPACE && this.animationSpeedInput.innerHTML.length === 0) { // prevent backspacing when empty
			event.preventDefault();
		} else if(keyCode >= 48 && keyCode <= 57 && this.animationSpeedInput.innerHTML.length >= 2) { // prevent going over 2 chars in input
			event.preventDefault();
		} else if((keyCode < 48 || keyCode > 57) && keyCode !== BACKSPACE && keyCode !== LEFT_ARROW && keyCode !== RIGHT_ARROW) {
			event.preventDefault();
		}
	}).bind(this);
}

// updates animation display -- calls itself while animationPlaying is true
AnimationWindow.prototype.updateAnimationDisplay = function() {
	if(animationWindow.animationPlaying) {
		if(Date.now() - animationWindow.lastDisplayWindowUpdateTime >= 1000 / animationWindow.animationFps) {
			// if frame index is above max, restart animation
			if(animationWindow.curAnimationDisplayFrame >= grid.curSprite.sprite.frames.length) animationWindow.curAnimationDisplayFrame = 0;
			animationWindow.drawFrame(animationWindow.curAnimationDisplayFrame);
			// increase current sprite's current frame by one
			++animationWindow.curAnimationDisplayFrame;
			// set last time was updated (to keep correct FPS)
			animationWindow.lastDisplayWindowUpdateTime = Date.now();
		}
		window.requestAnimationFrame(animationWindow.updateAnimationDisplay);
	}
}

AnimationWindow.prototype.setCurrentFrame = function(frameI) {
	var i;
	grid.curSprite.sprite.curFrameI = frameI;
	for(i = 0; i < this.animationSlides.length; ++i) {
		if(i !== grid.curSprite.sprite.curFrameI && this.animationSlides[i].id) this.animationSlides[i].removeAttribute('id');
		else if(i === grid.curSprite.sprite.curFrameI) this.animationSlides[i].id = 'curAnimationSlide';
	}
	grid.render();
	layersWindow.fullUpdate();
	// update animation display if not animating currently
	if(!this.animationPlaying) this.drawFrame();
}

// draws frame with index frameI of current sprite
var ANIMATION_DISPLAY_PADDING_PERCENT = .03; // padding on each side of max dimension (width or height)
AnimationWindow.prototype.drawFrame = function(frameI) {
	if(frameI === undefined) frameI = grid.curSprite.sprite.curFrameI;
	var ctx = this.animationDisplay.getContext('2d'),
		canvasUsable,
		offsetX, offsetY,
		pixelWidth,
		layerI, curLayer;
	// current sprite's width > height
	if(grid.curSprite.sprite.width > grid.curSprite.sprite.height) {
		offsetX = ctx.canvas.width * ANIMATION_DISPLAY_PADDING_PERCENT;
		canvasUsable = ctx.canvas.width - (ctx.canvas.width * ANIMATION_DISPLAY_PADDING_PERCENT * 2);
		pixelWidth = canvasUsable / grid.curSprite.sprite.width;
		offsetY = ctx.canvas.height / 2 - grid.curSprite.sprite.height / 2 * pixelWidth;
	} else {
		offsetY = ctx.canvas.height * ANIMATION_DISPLAY_PADDING_PERCENT;
		canvasUsable = ctx.canvas.height - (ctx.canvas.height * ANIMATION_DISPLAY_PADDING_PERCENT * 2);
		pixelWidth = canvasUsable / grid.curSprite.sprite.height;
		offsetX = ctx.canvas.width / 2 - grid.curSprite.sprite.width / 2 * pixelWidth;
	}
	// clear canvas
	ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height); 
	// draw all layers of frame
	for(rows = 0; rows < grid.curSprite.sprite.height; ++rows) {
		for(cols = 0; cols < grid.curSprite.sprite.width; ++cols) {
			for(layerI = 0; layerI < grid.curSprite.sprite.frames[frameI].layers.length; ++layerI) {
				curLayer = grid.curSprite.sprite.frames[frameI].layers[layerI];
				if(curLayer.visible && curLayer.pixels[rows][cols] !== '') {
					ctx.fillStyle = curLayer.pixels[rows][cols];
					ctx.fillRect(Math.floor(offsetX + cols*pixelWidth), Math.floor(offsetY + rows*pixelWidth), Math.ceil(pixelWidth), Math.ceil(pixelWidth));
					break;
				}
			}
		}
	}
}

AnimationWindow.prototype.update = function() {
	if(!grid.curSprite) return; // if no current sprite, no need (TODO remove slides if necessary)
	var i, rows, cols,
		newFrameSlide,
		numFrames = grid.curSprite.sprite.frames.length,
		maxDimension = grid.curSprite.sprite.width > grid.curSprite.sprite.height ? grid.curSprite.sprite.width : grid.curSprite.sprite.height,
		framePadding, // padding around each drawn frame inside of canvas
		frameWidth, // width of frame slide
		usableWidth, // width of drawable area (frameWidth * framePadding)
		drawOffsetX, drawOffsetY, // offset into the canvas to draw first pixel
		pixelWidth; // width of each drawn frame pixel
	// add or remove slides as needed
	if(numFrames > this.animationSlides.length) {
		while(this.animationSlides.length !== numFrames) {
			this.addSlide();
		}
	} else if(numFrames < this.animationSlides.length) {
		while(this.animationSlides.length !== numFrames) {
			this.removeSlide();
		}
	}
	// set current frame
	this.setCurrentFrame(grid.curSprite.sprite.curFrameI);
	// calculate padding around each frame's drawn image
	if(maxDimension <= MAX_FRAME_PADDING_SIZE) {
		framePadding = MAX_FRAME_PADDING;
	} else if(maxDimension >= MIN_FRAME_PADDING_SIZE) {
		framePadding = MIN_FRAME_PADDING;
	} else {
		framePadding = MAX_FRAME_PADDING - (MAX_FRAME_PADDING - MIN_FRAME_PADDING) * ((MAX_FRAME_PADDING_SIZE + maxDimension) / MIN_FRAME_PADDING_SIZE);
	}
	// draw each frame to its slide
	frameWidth = this.animationSlides[0].width;
	usableWidth = frameWidth - frameWidth * framePadding;
	pixelWidth = usableWidth / maxDimension;
	if(grid.curSprite.sprite.width > grid.curSprite.sprite.height) {
		drawOffsetX = (framePadding / 2) * frameWidth;
		drawOffsetY = frameWidth / 2 - grid.curSprite.sprite.height / 2 * pixelWidth;
	} else {
		drawOffsetY = (framePadding / 2) * frameWidth;
		drawOffsetX = frameWidth / 2 - grid.curSprite.sprite.width / 2 * pixelWidth;
	}
	// TODO very inefficient -- probably draw as-needed onto off-screen canvas for each frame, then just drawImage?

	for(i = 0; i < numFrames; ++i) {
		// highlight current frame
		if(i === grid.curSprite.sprite.curFrameI) {
			this.animationSlides[i].id = 'curAnimationSlide';
		}
		var ctx = this.animationSlides[i].getContext('2d');
		ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
		// go through layers and draw their pixels
		for(rows = 0; rows < grid.curSprite.sprite.height; ++rows) {
			for(cols = 0; cols < grid.curSprite.sprite.width; ++cols) {
				for(var layerI = 0; layerI < grid.curSprite.sprite.frames[i].layers.length; ++layerI) {
					var curLayer = grid.curSprite.sprite.frames[i].layers[layerI];
					if(curLayer.visible && curLayer.pixels[rows][cols] !== '') {
						ctx.fillStyle = curLayer.pixels[rows][cols];
						ctx.fillRect(Math.floor(drawOffsetX + cols*pixelWidth), Math.floor(drawOffsetY + rows*pixelWidth), Math.ceil(pixelWidth), Math.ceil(pixelWidth));
						break;
					}
				}
			}
		}
	}
	// update animation display if not animating currently
	if(!this.animationPlaying) this.drawFrame();
}

// adds an animation slide to the slides container
AnimationWindow.prototype.addSlide = function() {
	var newSlide = document.createElement("canvas");
	newSlide.className = ANIMATION_SLIDE_CLASS;
	this.slidesContainer.appendChild(newSlide);
	newSlide.width = newSlide.offsetWidth * AR;
	newSlide.height = newSlide.offsetHeight * AR;
	// on slide click, change to its frame
	var newSlideIndex = this.animationSlides.length; // hasn't been added yet
	newSlide.addEventListener('mouseup', (function(event) {
		if(!grid.curSprite) return; // TODO if have minimum one active sprite, remove this
		var slideIndex;
		// get current index of this slide
		for(slideIndex = 0; slideIndex < this.animationSlides.length; ++slideIndex) {
			if(this.animationSlides[slideIndex] === event.target) break;
		}
		this.setCurrentFrame(slideIndex);
	}).bind(this), false);
	this.animationSlides.push(newSlide);
}

// removes an animation slide from the slides container
AnimationWindow.prototype.removeSlide = function() {
	this.slidesContainer.removeChild(this.animationSlides[this.animationSlides.length-1]);
	this.animationSlides.splice(this.animationSlides.length-1, 1);
}
