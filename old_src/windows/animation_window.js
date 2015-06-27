var ANIMATION_SLIDES_CONTAINER_ID = 'animationSlidesContainer',
	ANIMATION_DISPLAY_ID = 'animationDisplay',
	ANIMATION_SLIDE_CLASS = 'animationSlide',
	NEW_ANIMATION_SLIDE_BUTTON_ID = 'newAnimationSlideButton',
	MAX_FRAME_PADDING = .80, // 80% frame padding at <= MAX_FRAME_PADDING_SIZE
	MAX_FRAME_PADDING_SIZE = 1,
	MIN_FRAME_PADDING = .14, // 10% frame padding at >= MIN_FRAME_PADDING_SIZE
	MIN_FRAME_PADDING_SIZE = 15;

function AnimationWindow() {
	this.slidesContainer = document.getElementById(ANIMATION_SLIDES_CONTAINER_ID);
	this.animationDisplay = document.getElementById(ANIMATION_DISPLAY_ID);
	this.newAnimationSlideButton = document.getElementById(NEW_ANIMATION_SLIDE_BUTTON_ID);
	this.animationSlides = [];

	this.addSlide();
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
			grid.render();
		}
	}).bind(this), false);
}

AnimationWindow.prototype.setCurrentFrame = function(frameI) {
		this.animationSlides[grid.curSprite.sprite.curFrameI].removeAttribute('id');
		grid.curSprite.sprite.curFrameI = frameI;
		this.animationSlides[frameI].id = 'curAnimationSlide';
		grid.render();
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
		drawOffset, // offset into the canvas to draw first pixel
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
	drawOffset = (framePadding / 2) * frameWidth;
	pixelWidth = usableWidth / maxDimension;
	// TODO center the lesser dimension
	// TODO very inefficient -- probably draw as-needed onto off-screen canvas for each frame, then just drawImage?
	for(i = 0; i < numFrames; ++i) {
		// highlight current frame
		if(i === grid.curSprite.sprite.curFrameI) {
			this.animationSlides[i].id = 'curAnimationSlide';
		}
		var ctx = this.animationSlides[i].getContext('2d');
		ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
		for(rows = 0; rows < grid.curSprite.sprite.height; ++rows) {
			for(cols = 0; cols < grid.curSprite.sprite.width; ++cols) {
				// TODO change 0 to curLayerI
				var curPxColor = grid.curSprite.sprite.frames[i].layers[grid.curSprite.sprite.frames[i].curLayerI].pixels[rows][cols];
				if(curPxColor !== '') {
					ctx.fillStyle = curPxColor;
					ctx.fillRect(drawOffset + cols*pixelWidth, drawOffset + rows*pixelWidth, pixelWidth, pixelWidth);
				}
			}
		}
	}
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
