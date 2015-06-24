var ANIMATION_SLIDES_CONTAINER_ID = 'animationSlidesContainer',
	ANIMATION_DISPLAY_ID = 'animationDisplay';

function AnimationWindow() {
	this.slidesContainer = document.getElementById(ANIMATION_SLIDES_CONTAINER_ID);
	this.animationDisplay = document.getElementById(ANIMATION_DISPLAY_ID);

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
}
