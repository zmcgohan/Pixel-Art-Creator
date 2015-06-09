var TOP_OFFSET = 20, LEFT_OFFSET = 20;

function ColorPalette() {
	Window.call(this);
	this.window = document.getElementById('colorPalette');
	this.colors = [ curColor, '#fafafa', '#0000FF', '#00FF00' ];
	this.updateNeeded = true;
	this.update();
	this.setPosition(TOP_OFFSET, window.innerWidth-LEFT_OFFSET-this.window.offsetWidth);
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
			newSlide.style.borderWidth = '3px';
			newSlide.style.borderColor = 'rgba(0,0,0,0.3)';
			newSlide.style.borderStyle = 'dashed';
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
	var newColorSlide = document.getElementById('newColorSlide');
	var newColorClickListener = function(event) {
		if(!this.dragged) {
			this.activateColorDialog();
		}
	}
	newColorSlide.addEventListener('click', newColorClickListener.bind(this), false);
	// successfully changed -- don't need to update until next needed
	this.updateNeeded = false;
}

// TODO TODO TODO canvases don't get updated when screen is resized.. NEEDS fixed
ColorPalette.prototype.activateColorDialog = function() {
	var ARROW_HEIGHT = 14,
		DEFAULT_HUE = 180;
	var newColorDialog = document.getElementById('newColorDialog'),
		satBrightBox = document.getElementById('saturationBrightnessBox'), // saturation and lightness chooser
		hueBar = document.getElementById('hueBar'), // hue chooser
		hueBarArrowCanvasLeft = document.getElementById('hueBarArrowCanvasLeft'),
		hueBarArrowCanvasRight = document.getElementById('hueBarArrowCanvasRight'),
		chosenColorDisplayCtx = document.getElementById('chosenColorDisplay').getContext('2d'),
		lastColorDisplayCtx = document.getElementById('lastColorDisplay').getContext('2d'),
		rValueInput = document.getElementById('rValueInput'),
		gValueInput = document.getElementById('gValueInput'),
		bValueInput = document.getElementById('bValueInput'),
		hValueInput = document.getElementById('hValueInput'),
		sValueInput = document.getElementById('sValueInput'),
		vValueInput = document.getElementById('vValueInput'),
		hexValueInput = document.getElementById('hexValueInput');

	// show newColorDialog
	newColorDialog.style.display = 'block';

	// TODO storing vars this way.. SO UGLY.
	hueBar.pixelArtMouseDown = false;
	hueBar.pixelArtHue = 180;
	satBrightBox.pixelArtMouseDown = false;
	satBrightBox.lastClickLoc = { x: satBrightBox.width / 2, y: satBrightBox.height / 2 };

	// set up hue-choosing bar's display
	function hueBarUpdate() {
		var hue = hueBar.pixelArtHue;
		var ctx = hueBar.getContext('2d');
		for(var i = 0; i < hueBar.height; ++i) {
			ctx.beginPath();
			ctx.moveTo(0,i);
			ctx.lineTo(hueBar.width,i);
			ctx.closePath();
			ctx.strokeStyle = 'hsl(' + ((i / hueBar.height) * 360) + ', 100%, 50%)';
			ctx.stroke();
		}
		// draw left hue bar arrow
		var ctx = hueBarArrowCanvasLeft.getContext('2d'),
			yOffset = hue*(hueBar.height)/360 + vmaxToPx(0.6 * AR);
		ctx.clearRect(0,0,hueBarArrowCanvasLeft.width,hueBarArrowCanvasLeft.height);
		ctx.beginPath();
		ctx.moveTo(hueBarArrowCanvasLeft.width, yOffset);
		ctx.lineTo(0, yOffset - ARROW_HEIGHT/2);
		ctx.lineTo(0, yOffset + ARROW_HEIGHT/2);
		ctx.closePath();
		ctx.fillStyle = '#666666';
		ctx.fill();
		ctx.strokeStyle = '#cccccc';
		ctx.stroke();
		// draw right hue bar arrow
		var ctx = hueBarArrowCanvasRight.getContext('2d'),
			yOffset = hue*(hueBar.height)/360 + vmaxToPx(0.6 * AR);
		ctx.clearRect(0,0,hueBarArrowCanvasRight.width,hueBarArrowCanvasRight.height);
		ctx.beginPath();
		ctx.moveTo(0, yOffset);
		ctx.lineTo(hueBarArrowCanvasRight.width, yOffset - ARROW_HEIGHT/2);
		ctx.lineTo(hueBarArrowCanvasRight.width, yOffset + ARROW_HEIGHT/2);
		ctx.closePath();
		ctx.fillStyle = '#666666';
		ctx.fill();
		ctx.strokeStyle = '#cccccc';
		ctx.stroke();
	}
	hueBarUpdate();
	// set up saturation/brightness choosing box's display
	function satBrightBoxUpdate() {
		var STEP_SIZE = 2;
		var ctx = satBrightBox.getContext('2d');
		for(var i = 0; i <= satBrightBox.width; i += STEP_SIZE) {
			for(var j = 0; j <= satBrightBox.height; j += STEP_SIZE) {
				var hue = hueBar.pixelArtHue,
					saturationPercent = i / satBrightBox.width,
					brightnessPercent = (satBrightBox.height-j) / satBrightBox.height;
				ctx.fillStyle = hsvToRGBString(hue, saturationPercent, brightnessPercent);
				ctx.fillRect(i,j,STEP_SIZE,STEP_SIZE);
			}
		}
		// stroke circle at last click pos
		ctx.beginPath();
		ctx.arc(satBrightBox.lastClickLoc.x, satBrightBox.lastClickLoc.y, vmaxToPx(1.2), 0, 2*Math.PI, true);
		ctx.lineWidth = 3;
		//var greyLevel = Math.floor(Math.pow(satBrightBox.lastClickLoc.y / satBrightBox.height, 3)*211+34);
		var greyLevel = satBrightBox.lastClickLoc.y > satBrightBox.height / 2 ? 250 : 34;
		ctx.strokeStyle = 'rgb(' + greyLevel + ',' + greyLevel + ',' + greyLevel +')';
		ctx.stroke();
	}
	satBrightBoxUpdate();

	// hueBar value changed
	function changeHue(event) {
		if(hueBar.pixelArtMouseDown) {
			var offset = getCursorOffset(event),
				newHue = Math.floor((offset.y / (hueBar.height/AR))*360);
			if(newHue > 359) newHue = 359;
			else if(newHue < 0) newHue = 0;
			hueBar.pixelArtHue = newHue;
			hueBarUpdate();
			satBrightBoxUpdate();
			updateColorDisplays();
		}
	}
	// hueBar events
	hueBar.addEventListener('mousedown', function(event) { hueBar.pixelArtMouseDown = true; changeHue(event); }, false);
	hueBar.addEventListener('mousemove', changeHue, false);

	// saturation & brightness box changed
	function changeSB(event) { 
		if(satBrightBox.pixelArtMouseDown) {
			var offset = getCursorOffset(event);
			satBrightBox.lastClickLoc = { x: offset.x * AR, y: offset.y * AR };
			satBrightBoxUpdate();
			updateColorDisplays();
		}
	}
	satBrightBox.addEventListener('mousedown', function(event) { satBrightBox.pixelArtMouseDown = true; changeSB(event); }, false);
	satBrightBox.addEventListener('mousemove', changeSB, false);

	// update the color displays
	function updateColorDisplays() {
		var hue = hueBar.pixelArtHue,
			saturationPercent = satBrightBox.lastClickLoc.x / satBrightBox.width,
			brightnessPercent = (satBrightBox.height - satBrightBox.lastClickLoc.y) / satBrightBox.height,
			rgbString = hsvToRGBString(hue, saturationPercent, brightnessPercent);
		chosenColorDisplayCtx.fillStyle = rgbString;
		chosenColorDisplayCtx.fillRect(0,0,chosenColorDisplayCtx.canvas.width,chosenColorDisplayCtx.canvas.height);
		lastColorDisplayCtx.fillStyle = rgbString;
		lastColorDisplayCtx.fillRect(0,0,lastColorDisplayCtx.canvas.width,lastColorDisplayCtx.canvas.height);
		// TODO everything after this was done dead tired. Make it better
		hValueInput.value = hue;
		sValueInput.value = Math.floor(saturationPercent * 100);
		vValueInput.value = Math.floor(brightnessPercent * 100);
	}
	updateColorDisplays();

	// mouse up event -- change mouseDown values for both hueBar & satLightBox
	window.addEventListener('mouseup', function() { hueBar.pixelArtMouseDown = false; satBrightBox.pixelArtMouseDown = false; }, false);
}
