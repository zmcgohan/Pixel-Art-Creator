function ColorPalette() {
	Window.call(this);
	this.paletteContainer = document.getElementById('colorPalette');
	this.colorSlidesContainer = document.getElementById('colorSlidesContainer');
	this.upArrow = document.getElementById('paletteUpArrow');
	this.downArrow = document.getElementById('paletteDownArrow');
	this.paletteChooseButton = document.getElementById('paletteChooseButton');
	//this.newColorSlide = document.getElementById('newColorSlide');
	this.palettesNew = [ [ new Color(0, 1, 1), new Color(120, 1, 1), new Color(240, 1, 1) ], [] ];
	this.palettes = [ [ curColor, '#fafafa', '#0000FF', '#00ff00' ], [] ]; // last palette will always be empty, the "new" palette
	this.curPaletteI = 0;
	// get all color slides
	this.slides = [];
	this.curSlideI = 0;

	// set up initial look and add event listeners
	this.updateNeeded = true;
	this.update();
	this.addEventListeners();
}

ColorPalette.prototype = Object.create(Window.prototype);

/* Define the getter for curColor. */
Object.defineProperty(ColorPalette.prototype, "curColor", {
	get: function curColor() {
		return this.palettes[this.curPaletteI][this.curSlideI];
	}
});

ColorPalette.prototype.addEventListeners = function() {
	// click listener to palette up/down arrows
	this.upArrow.onmouseup = (function(event) {
		this.changePalette(this.curPaletteI + 1);
	}).bind(this);
	this.downArrow.onmouseup = (function(event) {
		this.changePalette(this.curPaletteI - 1);
	}).bind(this);
}

// change the current palette's index
ColorPalette.prototype.changePalette = function(paletteI) {
	// if last palette isn't an empty, "new", palette, make it so
	if(this.palettes[this.palettes.length-1].length !== 0) this.palettes.push([]);
	// if index isn't in range, change it (out-of-range always go to last empty palette)
	if(paletteI < 0) paletteI = this.palettes.length-1;
	else if(paletteI > this.palettes.length-1) paletteI = 0;
	this.paletteChooseButton.innerHTML = paletteI + 1;
	this.curPaletteI = paletteI;
	this.updateNeeded = true;
	this.update();
}

// gets the correct color slide class name for how many colors there are
ColorPalette.prototype.getSlideClass = function() {
	if(this.palettes[this.curPaletteI].length > 4) {
		return 'colorSlideSmall';
	} else {
		return 'colorSlideLarge';
	}
}

ColorPalette.prototype.update = function() {
	var i, newSlide, className, classNameUnused;
	if(!this.updateNeeded) return;
	className = this.getSlideClass();
	classNameUnused = className + 'Unused';
	this.setNumSlides(this.palettes[this.curPaletteI].length+1);
	// add each color slide, set its style properties and events
	for(i = 0; i < this.slides.length; ++i) {
		if(this.palettes[this.curPaletteI][i]) {
			this.slides[i].className = className;
			this.slides[i].style.background = this.palettes[this.curPaletteI][i];
			//if(this.palettes[this.curPaletteI][i] === curColor) this.slides[i].className += ' curSlide';
			if(i === this.curSlideI) this.slides[i].className += ' curSlide';
		} else {
			this.slides[i].className = classNameUnused;
			this.slides[i].removeAttribute('style');
		}
	}
	// successfully changed -- don't need to update until next needed
	this.updateNeeded = false;
}

// revises the number of color slides, visually and in the array
ColorPalette.prototype.setNumSlides = function(numSlides) {
	var newSlide;
	while(this.slides.length < numSlides) {
		newSlide = document.createElement('span');
		// if slide currently has color, make it the current color -- if not, open up color picker to change it
		newSlide.onmouseup = (function() {
			var colorI = this.slides.length;
			return (function(event) {
				// TODO choosing new colors is a MESS with the code right now (it's everywhere)
				if(this.palettes[this.curPaletteI][colorI]) {
					// currently choosing a color? cancel it on click
					if(colorPicker.newColorDialog.style.display === 'block')
						colorPicker.toggleVisibility();
					// change the current color
					curColor = this.palettes[this.curPaletteI][colorI];
					this.curSlideI = colorI;
					this.updateNeeded = true;
					this.update();
				} else {
					colorPicker.setNewSlideColor(colorI);
				}
			}).bind(this);
		}).bind(this)();
		// if clicked slide has a color, set up so it can be changed
		newSlide.ondblclick = (function() {
			var colorI = this.slides.length;
			return (function(event) {
				if(this.palettes[this.curPaletteI][colorI]) {
					colorPicker.updateSlideColor(colorI);
				}
			}).bind(this);
		}).bind(this)();
		this.colorSlidesContainer.appendChild(newSlide);
		this.slides.push(newSlide);
	}
	while(this.slides.length > numSlides) {
		this.colorSlidesContainer.removeChild(this.slides.pop());
	}
}

ColorPalette.prototype.addColor = function(color) {
	this.palettes[this.curPaletteI].push(color);
	this.updateNeeded = true;
	this.update();
}
