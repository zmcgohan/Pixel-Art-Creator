var COLOR_PICKER_ARROW_HEIGHT = 14,
	COLOR_PICKER_DEFAULT_HUE = 180;

function ColorPicker() {
	this.hue = COLOR_PICKER_DEFAULT_HUE;
	this.saturation = 50;
	this.brightness = 50;

	// get GUI elements
	this.newColorDialog = document.getElementById('newColorDialog');
	this.satBrightBox = document.getElementById('saturationBrightnessBox'); // saturation and lightness chooser
	this.brightnessOverlay = document.getElementById('brightnessOverlay');
	this.hueBar = document.getElementById('hueBar'); // hue chooser
	this.hueBarArrowCanvasLeft = document.getElementById('hueBarArrowCanvasLeft');
	this.hueBarArrowCanvasRight = document.getElementById('hueBarArrowCanvasRight');
	this.chosenColorDisplayCtx = document.getElementById('chosenColorDisplay').getContext('2d');
	this.lastColorDisplayCtx = document.getElementById('lastColorDisplay').getContext('2d');
	this.redValueInput = document.getElementById('redValueInput');
	this.greenValueInput = document.getElementById('greenValueInput');
	this.blueValueInput = document.getElementById('blueValueInput');
	this.hueValueInput = document.getElementById('hueValueInput');
	this.saturationValueInput = document.getElementById('saturationValueInput');
	this.valueValueInput = document.getElementById('valueValueInput');
	this.hexValueInput = document.getElementById('hexValueInput');
	this.saveColorButton = document.getElementById('saveColorButton');

	// color picker visible or not
	this.visible = false;

	// is hue bar drawn?
	this.hueBarDrawUpdateNeeded = true;
	this.hueBarMouseDown = false;

	// last click location of sat bright box
	this.lastSBBoxClickLoc = { x: this.satBrightBox.width / 2, y: this.satBrightBox.height / 2 };
	// mouse down on sat bright box?
	this.satBrightBoxMouseDown = false;

	// currently being edited slide
	this.changingSlideI = undefined;
	// last color of current slide
	this.lastSlideColor = undefined;
	this.settingNewColor = false; // setting new or current slide's color?

	this.addEventListeners();
}

ColorPicker.prototype.addEventListeners = function() {
	/* HUE BAR EVENTS */
	// hue bar clicked
	this.hueBar.addEventListener('mousedown', (function(event) {
		this.hueBarMouseDown = true;
		this.handleHueBarEvent(event);
	}).bind(this), false);
	// mouse moved on hue bar -- mouse down? -> update
	this.hueBar.addEventListener('mousemove', (function(event) {
		if(this.hueBarMouseDown)
			this.handleHueBarEvent(event);
	}).bind(this), false);

	/* SATURATION/BRIGHTNESS BOX EVENTS */
	this.brightnessOverlay.addEventListener('mousedown', (function(event) {
		this.satBrightBoxMouseDown = true;
		this.handleSatBrightBoxEvent(event);
	}).bind(this), false);
	this.brightnessOverlay.addEventListener('mousemove', (function(event) {
		if(this.satBrightBoxMouseDown)
			this.handleSatBrightBoxEvent(event);
	}).bind(this), false);


	// mouse up for hue bar and sat/bright box
	window.addEventListener('mouseup', (function(event) {
		this.hueBarMouseDown = false;
		this.satBrightBoxMouseDown = false;
	}).bind(this), false);

	/* RGB/HSV/Hex INPUT EVENTS */
	// add input events (RGB, HSV, Hex)
	this.redValueInput.onkeydown = this.greenValueInput.onkeydown = this.blueValueInput.onkeydown =
		this.hueValueInput.onkeydown = this.saturationValueInput.onkeydown = this.valueValueInput.onkeydown =
		this.hexValueInput.onkeydown = (function(event) {
			var BACKSPACE = 8, TAB = 9, LEFT_ARROW = 37, RIGHT_ARROW = 39,
				keyCode = event.keyCode || event.which,
				textHighlighted;
			// determine if text is highlighted
			var curRange = window.getSelection().getRangeAt(0);
			textHighlighted = curRange.startContainer === event.target.childNodes[0] && curRange.endContainer === event.target.childNodes[0] && curRange.endOffset - curRange.startOffset > 0;
			if(keyCode === BACKSPACE && event.target.innerHTML.length === 0) {
				event.preventDefault();
			} else if(keyCode === TAB) {
				if(event.target.id === 'hexValueInput') {
					window.setTimeout(function() { this.redValueInput.focus(); }, 1);
				}
			} else if(((event.target.id === 'hexValueInput' && !(48 <= keyCode && keyCode <=57) && !(65 <= keyCode && keyCode <= 70)) ||
				(event.target.id !== 'hexValueInput' && !(keyCode >= 48 && keyCode <= 57)))
				&& keyCode !== BACKSPACE && keyCode !== LEFT_ARROW && keyCode !== RIGHT_ARROW) {
				event.preventDefault();
			} else if(((event.target.id === 'hexValueInput' && ((48 <= keyCode && keyCode <= 57) || (65 <= keyCode && keyCode <= 70))) ||
					(event.target.id !== 'hexValueInput' && keyCode >= 48 && keyCode <= 57))
				&& ((event.target.id !== 'hexValueInput' && event.target.innerHTML.length >= 3) || (event.target.id === 'hexValueInput' && event.target.innerHTML.length >= 6)) && !textHighlighted) { // make sure inputs don't go over the correct length
				event.preventDefault();
			}
		}).bind(this);

	// when inputs are actually changed, update screen
	// RGB changed
	this.redValueInput.oninput = this.greenValueInput.oninput = this.blueValueInput.oninput = (function(event) {
			this.handleRGBInputChange();
		}).bind(this);
	// HSV changed
	this.hueValueInput.oninput = this.saturationValueInput.oninput = this.valueValueInput.oninput = (function(event) {
			this.handleHSVInputChange();
		}).bind(this);
	// Hex changed
	this.hexValueInput.oninput = (function(event) {
			this.handleHexInputChange();
		}).bind(this);

	// when inputs are focused on, highlight
	this.redValueInput.onfocus = this.greenValueInput.onfocus = this.blueValueInput.onfocus = 
		this.hueValueInput.onfocus = this.saturationValueInput.onfocus = this.valueValueInput.onfocus =
		this.hexValueInput.onfocus = 
	(function(event) {
		if(event.target.childNodes.length === 0) return; // don't highlight if no text nodes
		window.setTimeout(function() {
			var selection = window.getSelection(),
				range = document.createRange();
			range.selectNodeContents(event.target.childNodes[0]);
			selection.removeAllRanges();
			selection.addRange(range);
		}, 1);
	}).bind(this);

	/* ADD COLOR BUTTON */
	this.saveColorButton.onclick = (function(event) {
		var rgb = hsvToRGB(this.hue, this.saturation / 100, this.brightness / 100),
			rgbString = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
		if(!this.lastSlideColor)
			colorPalette.addColor(rgbString);
		else
			colorPalette.palettes[colorPalette.curPaletteI][this.changingSlideI] = rgbString;
		colorPalette.curSlideI = this.changingSlideI;
		curColor = rgbString;
		colorPalette.updateNeeded = true;
		colorPalette.update();
		this.toggleVisibility();
	}).bind(this)
}

// begin setting a new slide's color
ColorPicker.prototype.setNewSlideColor = function(slideI) {
	// change class of slide so that its changing color can be viewed
	colorPalette.slides[slideI].className = colorPalette.getSlideClass();
	// set all needed variables inside this color picker
	this.changingSlideI = slideI;
	this.lastSlideColor = undefined;
	this.settingNewColor = true;
	this.chosenColorDisplayCtx.canvas.className = 'colorDisplay onlyColorDisplay';
	// set default color picker settings
	this.hue = 180;
	this.saturation = 50;
	this.brightness = 50;
	this.fullUpdate();
	// make picker visible
	this.toggleVisibility();
}

// begin editing an already-set slide's color
ColorPicker.prototype.updateSlideColor = function(slideI) {
	this.changingSlideI = slideI;
	this.lastSlideColor = colorPalette.palettes[colorPalette.curPaletteI][slideI];
	this.settingNewColor = false;
	this.chosenColorDisplayCtx.canvas.className = 'colorDisplay';
	// TODO set color picker settings to current slide color
	this.fullUpdate();
	this.toggleVisibility();
}

ColorPicker.prototype.toggleVisibility = function() {
	if(this.newColorDialog.style.display !== 'block') {
		this.newColorDialog.style.display = 'block';
	} else {
		this.newColorDialog.style.display = 'none';
		// TODO isn't a very good spot for a color palette update (shouldn't be managed by this class)
		colorPalette.updateNeeded = true;
		colorPalette.update();
	}
}

ColorPicker.prototype.fullUpdate = function() {
	this.hueBarDrawUpdateNeeded = true;
	this.hueBarUpdate();
	this.satBrightBoxUpdate();
	this.updateColorDisplays();
	this.updateColorInputs();
	this.updateCurrentSlide();
}

ColorPicker.prototype.updateCurrentSlide = function() {
	// if last slide's color is set, don't continue -- changing a current slide
	if(this.lastSlideColor || !this.changingSlideI) return;
	var curSlide = colorPalette.slides[this.changingSlideI],
		rgb = hsvToRGB(this.hue, this.saturation / 100, this.brightness / 100);
	curSlide.style.background = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
}

// handle a change in the HSV input fields (update values of ColorPicker and update displays if needed)
ColorPicker.prototype.handleHSVInputChange = function(event) {
	// set new value
	this.hue = parseInt(this.hueValueInput.innerHTML);
	this.saturation = parseInt(this.saturationValueInput.innerHTML);
	this.brightness = parseInt(this.valueValueInput.innerHTML);
	// if field is over the max allowed value, reduce it
	if(this.hue > 255) this.hue = 255;
	if(this.saturation > 100) this.saturation = 100;
	if(this.brightness > 100) this.brightness = 100;
	// if field is empty, = NaN, set to 0
	if(isNaN(this.hue)) this.hue = 0;
	if(isNaN(this.saturation)) this.saturation = 0;
	if(isNaN(this.brightness)) this.brightness = 0;
	// update displays
	this.satBrightBoxUpdate();
	this.updateColorDisplays();
	this.updateColorInputs('hsv');
	this.updateCurrentSlide();
}

// handle a change in the RGB input fields (update values of ColorPicker and update displays if needed)
ColorPicker.prototype.handleRGBInputChange = function(event) {
	var red = parseInt(this.redValueInput.innerHTML),
		green = parseInt(this.greenValueInput.innerHTML),
		blue = parseInt(this.blueValueInput.innerHTML),
		hsv;
	// R/G/B empty? = 0
	if(isNaN(red)) red = 0;
	if(isNaN(green)) green = 0;
	if(isNaN(blue)) blue = 0;
	// R/G/B over 255? set to 255
	if(red > 255) red = 255;
	if(green > 255) green = 255;
	if(blue > 255) blue = 255;

	hsv = rgbToHSV(red, green, blue);
	this.hue = hsv.h;
	this.saturation = hsv.s;
	this.brightness = hsv.v;
	// update displays
	this.satBrightBoxUpdate();
	this.updateColorDisplays();
	this.updateColorInputs('rgb');
	this.updateCurrentSlide();
}

// handle a change in the hex input field (update values of ColorPicker and update displays if needed)
ColorPicker.prototype.handleHexInputChange = function(event) {
	if(this.hexValueInput.innerHTML.length !== 3 && this.hexValueInput.innerHTML.length !== 6) return; // if value isn't 3 or 6 characters, don't update
	var red, green, blue, hsv;
	if(this.hexValueInput.innerHTML.length === 6) {
		red = parseInt(this.hexValueInput.innerHTML.substring(0,2), 16);
		green = parseInt(this.hexValueInput.innerHTML.substring(2,4), 16);
		blue = parseInt(this.hexValueInput.innerHTML.substring(4,6), 16);
	} else {
		red = parseInt(this.hexValueInput.innerHTML.substring(0,1) + this.hexValueInput.innerHTML.substring(0,1), 16);
		green = parseInt(this.hexValueInput.innerHTML.substring(1,2) + this.hexValueInput.innerHTML.substring(1,2), 16);
		blue = parseInt(this.hexValueInput.innerHTML.substring(2,3) + this.hexValueInput.innerHTML.substring(2,3), 16);
	}
	// R/G/B over 255? set to 255
	if(red > 255) red = 255;
	if(green > 255) green = 255;
	if(blue > 255) blue = 255;
	hsv = rgbToHSV(red, green, blue);
	this.hue = hsv.h;
	this.saturation = hsv.s;
	this.brightness = hsv.v;
	// update displays
	this.satBrightBoxUpdate();
	this.updateColorDisplays();
	this.updateColorInputs('hex');
	this.updateCurrentSlide();
}

// handle events on the hue bar display
ColorPicker.prototype.handleHueBarEvent = function(event) {
	var offset = getCursorOffset(event),
		newHue = Math.floor((offset.y / (hueBar.height/AR))*360);
	if(newHue > 359) newHue = 359;
	else if(newHue < 0) newHue = 0;
	this.hue = newHue;
	this.hueBarUpdate();
	this.satBrightBoxUpdate();
	this.updateColorDisplays();
	this.updateColorInputs();
	this.updateCurrentSlide();
}

// handle events on the saturation/brightness box display
ColorPicker.prototype.handleSatBrightBoxEvent = function(event) {
	var offset = getCursorOffset(event);
	this.lastSBBoxClickLoc = { x: offset.x * AR, y: offset.y * AR };
	// change saturation and brightness values
	this.saturation = this.lastSBBoxClickLoc.x / this.satBrightBox.width * 100;
	this.brightness = (this.satBrightBox.height - this.lastSBBoxClickLoc.y) / this.satBrightBox.height * 100;
	this.satBrightBoxUpdate();
	this.updateColorDisplays();
	this.updateColorInputs();
	this.updateCurrentSlide();
}

// update the hue bar's displays
ColorPicker.prototype.hueBarUpdate = function() {
	var hue = this.hue;
	var ctx = this.hueBar.getContext('2d');
	if(this.hueBarDrawUpdateNeeded) {
		for(var i = 0; i < this.hueBar.height; ++i) {
			ctx.beginPath();
			ctx.moveTo(0,i);
			ctx.lineTo(this.hueBar.width,i);
			ctx.closePath();
			ctx.strokeStyle = 'hsl(' + ((i / this.hueBar.height) * 360) + ', 100%, 50%)';
			ctx.stroke();
		}
		this.hueBarDrawUpdateNeeded = false;
	}
	// draw left hue bar arrow
	var ctx = this.hueBarArrowCanvasLeft.getContext('2d'),
		yOffset = hue*(this.hueBar.height)/360 + vmaxToPx(0.6 * AR);
	ctx.clearRect(0,0,this.hueBarArrowCanvasLeft.width,this.hueBarArrowCanvasLeft.height);
	ctx.beginPath();
	ctx.moveTo(this.hueBarArrowCanvasLeft.width, yOffset);
	ctx.lineTo(0, yOffset - COLOR_PICKER_ARROW_HEIGHT/2);
	ctx.lineTo(0, yOffset + COLOR_PICKER_ARROW_HEIGHT/2);
	ctx.closePath();
	ctx.fillStyle = '#666666';
	ctx.fill();
	ctx.strokeStyle = '#cccccc';
	ctx.stroke();
	// draw right hue bar arrow
	var ctx = this.hueBarArrowCanvasRight.getContext('2d'),
		yOffset = hue*(this.hueBar.height)/360 + vmaxToPx(0.6 * AR);
	ctx.clearRect(0,0,this.hueBarArrowCanvasRight.width,this.hueBarArrowCanvasRight.height);
	ctx.beginPath();
	ctx.moveTo(0, yOffset);
	ctx.lineTo(this.hueBarArrowCanvasRight.width, yOffset - COLOR_PICKER_ARROW_HEIGHT/2);
	ctx.lineTo(this.hueBarArrowCanvasRight.width, yOffset + COLOR_PICKER_ARROW_HEIGHT/2);
	ctx.closePath();
	ctx.fillStyle = '#666666';
	ctx.fill();
	ctx.strokeStyle = '#cccccc';
	ctx.stroke();
}

// update the saturation/brightness box
ColorPicker.prototype.satBrightBoxUpdate = function() {
	var STEP_SIZE = 2;
	var ctx = this.satBrightBox.getContext('2d');
	var overlayCtx = this.brightnessOverlay.getContext('2d');
	var cursorXPos = this.saturation / 100 * ctx.canvas.width, cursorYPos = ctx.canvas.height - this.brightness / 100 * ctx.canvas.height;
	/* DRAW BOTH AXES */
	/*
	for(var i = 0; i <= this.satBrightBox.width; i += STEP_SIZE) {
		for(var j = 0; j <= this.satBrightBox.height; j += STEP_SIZE) {
			var hue = this.hue,
				saturationPercent = i / this.satBrightBox.width,
				brightnessPercent = (this.satBrightBox.height-j) / this.satBrightBox.height;
			ctx.fillStyle = hsvToRGBString(hue, saturationPercent, brightnessPercent);
			ctx.fillRect(i,j,STEP_SIZE,STEP_SIZE);
		}
	}
	*/
	/* DRAW ONLY SATURATION -- OVERLAY FOR BRIGHTNESS (takes < 1% of the time as both axes) */
	for(var i = 0; i <= this.satBrightBox.width; i += STEP_SIZE) {
			var hue = this.hue,
				saturationPercent = i / this.satBrightBox.width,
				brightnessPercent = 1.0;
			ctx.fillStyle = hsvToRGBString(hue, saturationPercent, brightnessPercent);
			ctx.fillRect(i,0,STEP_SIZE,this.satBrightBox.height);
	}
	// stroke circle at last click pos
	overlayCtx.clearRect(0, 0, overlayCtx.canvas.width, overlayCtx.canvas.height);
	overlayCtx.beginPath();
	overlayCtx.arc(cursorXPos, cursorYPos, vmaxToPx(1.2), 0, 2*Math.PI, true);
	overlayCtx.lineWidth = 3;
	var greyLevel = cursorYPos > this.satBrightBox.height / 2 ? 250 : 34;
	overlayCtx.strokeStyle = 'rgb(' + greyLevel + ',' + greyLevel + ',' + greyLevel +')';
	overlayCtx.stroke();
}

ColorPicker.prototype.updateColorDisplays = function() {
	// update color displays
	var hue = this.hue,
		saturationPercent = this.saturation / 100,
		brightnessPercent = this.brightness / 100,
		rgb = hsvToRGB(hue, saturationPercent, brightnessPercent),
		rgbString = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b +')',
		hexString = ('00' + rgb.r.toString(16)).slice(-2) + ('00' + rgb.g.toString(16)).slice(-2) + ('00' + rgb.b.toString(16)).slice(-2);
	this.chosenColorDisplayCtx.fillStyle = rgbString;
	this.chosenColorDisplayCtx.fillRect(0,0,this.chosenColorDisplayCtx.canvas.width,this.chosenColorDisplayCtx.canvas.height);
	if(this.lastSlideColor) {
		this.lastColorDisplayCtx.fillStyle = this.lastSlideColor;
		this.lastColorDisplayCtx.fillRect(0,0,this.lastColorDisplayCtx.canvas.width,this.lastColorDisplayCtx.canvas.height);
	}
}

// update RGB, HSV and hex inputs' text
// if exclusion is set to a color type, that type will not be updated
// 		Ex.: if 'rgb', rgb inputs won't be updated
ColorPicker.prototype.updateColorInputs = function(exclusion) {
	var hue = this.hue,
		saturationPercent = this.saturation / 100,
		brightnessPercent = this.brightness / 100,
		rgb = hsvToRGB(hue, saturationPercent, brightnessPercent),
		hexString = ('00' + rgb.r.toString(16)).slice(-2) + ('00' + rgb.g.toString(16)).slice(-2) + ('00' + rgb.b.toString(16)).slice(-2);
	if(exclusion !== 'rgb') {
		this.redValueInput.innerHTML = rgb.r;
		this.greenValueInput.innerHTML = rgb.g;
		this.blueValueInput.innerHTML = rgb.b;
	}
	if(exclusion !== 'hsv') {
		this.hueValueInput.innerHTML = hue;
		this.saturationValueInput.innerHTML = Math.floor(saturationPercent * 100);
		this.valueValueInput.innerHTML = Math.floor(brightnessPercent * 100);
	}
	if(exclusion !== 'hex')
		this.hexValueInput.innerHTML = hexString;

}
