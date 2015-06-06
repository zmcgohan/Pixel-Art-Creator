function ColorPalette() {
	this.update = function() {
		if(!this.updateNeeded) return;
		var slideWidth = MIN_SCREEN_WIDTH / 8 + (canvas.width-MIN_SCREEN_WIDTH) / 300;

		// remove current children
		while(this.window.firstChild) this.window.removeChild(this.window.firstChild);
		var i, newSlide;
		// add each color slide, set its style properties and events
		for(i = 0; i < this.colors.length; ++i) {
			newSlide = document.createElement('div');
			newSlide.pixelArtColor = this.colors[i];
			newSlide.style.background = this.colors[i];
			newSlide.style.position = 'relative';
			newSlide.style.display = 'inline-block';
			newSlide.style.width = slideWidth + 'px';
			newSlide.style.height = slideWidth / (mainGrid.cellHeight / mainGrid.cellWidth) + 'px';
			newSlide.style.marginRight = '5px';
			if(curColor === this.colors[i]) {
				newSlide.style.borderWidth = '3px';
				newSlide.style.borderColor = 'rgba(0,0,0,0.3)';
				newSlide.style.borderStyle = 'dashed';
			}
			this.window.appendChild(newSlide);
			var slideClickListener = function(event) {
				if(!this.dragged) {
					curColor = event.target.pixelArtColor; 
					this.updateNeeded = true;
					this.update();
				}
			}
			newSlide.addEventListener('click', slideClickListener.bind(this), false);
		}
		// add the '+' "Add Color" slide
		newSlide = document.createElement('div');
		newSlide.style.background = 'rgba(200,200,200,0.8)';
		newSlide.innerHTML = '+';
		newSlide.style.textAlign = 'center';
		newSlide.style.position = 'relative';
		newSlide.style.display = 'inline-block';
		newSlide.style.width = slideWidth + 'px';
		newSlide.style.height = slideWidth / (mainGrid.cellHeight / mainGrid.cellWidth) + 'px';
		this.window.appendChild(newSlide);
		var newColorClickListener = function(event) {
			if(!this.dragged) {
				this.activateColorDialog();
			}
		}
		newSlide.addEventListener('click', newColorClickListener.bind(this), false);
		// TODO delete when done with color dialog
		this.activateColorDialog();
		// successfully changed -- don't need to update until next needed
		this.updateNeeded = false;
	}
	this.activateColorDialog = function() {
		// create main container for all color dialog children
		var newColorDialog = document.createElement('div');
		newColorDialog.style.position = 'absolute';
		newColorDialog.style.width = '100%';
		newColorDialog.style.height = '300%';
		newColorDialog.style.background = 'rgba(34,34,34,0.85)';
		newColorDialog.style.left = '0px';
		newColorDialog.style.top = '110%';
		newColorDialog.style.padding = '3%';
		this.window.appendChild(newColorDialog);
		// create HSB saturation/brightness choosing box
		var satLightBox = document.createElement('canvas'); // saturation and lightness chooser
		satLightBox.style.width = '50%';
		satLightBox.style.height = '100%';
		satLightBox.style.marginRight = '2%';
		satLightBox.style.borderStyle = 'solid';
		satLightBox.style.borderWidth = '1px';
		satLightBox.style.borderColor = 'rgb(100,100,100)';
		satLightBox.style.borderRadius = '2px';
		newColorDialog.appendChild(satLightBox);
		satLightBox.width = satLightBox.offsetWidth * AR;
		satLightBox.height = satLightBox.offsetHeight * AR;
		// create hue-choosing bar
		var hueBar = document.createElement('canvas'); // hue chooser
		hueBar.style.width = '9%';
		hueBar.style.height = '100%';
		hueBar.style.borderStyle = 'solid';
		hueBar.style.borderWidth = '1px';
		hueBar.style.borderColor = 'rgb(100,100,100)';
		hueBar.style.borderRadius = '2px';
		hueBar.style.marginRight = '0.5%';
		newColorDialog.appendChild(hueBar);
		hueBar.width = hueBar.offsetWidth * AR;
		hueBar.height = hueBar.offsetHeight * AR;
		var hueBarArrowCanvas = document.createElement('canvas');
		var ARROW_HEIGHT = 12;
		hueBarArrowCanvas.style.width = '2.5%';
		hueBarArrowCanvas.style.height = newColorDialog.offsetHeight + 'px';
		hueBarArrowCanvas.style.position = 'absolute';
		hueBarArrowCanvas.style.top = '0px';
		hueBarArrowCanvas.style.opacity = '.8';
		//hueBarArrowCanvas.style.top = '-.5%';
		//hueBarArrowCanvas.
		newColorDialog.appendChild(hueBarArrowCanvas);
		hueBarArrowCanvas.width = hueBarArrowCanvas.offsetWidth * AR;
		hueBarArrowCanvas.height = hueBarArrowCanvas.offsetHeight * AR;
		// set up hue-choosing bar's display
		function hueBarUpdate(hue) {
			var ctx = hueBar.getContext('2d');
			for(var i = 0; i < hueBar.height; ++i) {
				ctx.beginPath();
				ctx.moveTo(0,i);
				ctx.lineTo(hueBar.width,i);
				ctx.closePath();
				ctx.strokeStyle = 'hsl(' + ((i / hueBar.height) * 360) + ', 100%, 50%)';
				ctx.stroke();
			}
			var ctx = hueBarArrowCanvas.getContext('2d'),
				yOffset = hue*(hueBar.height)/360 + newColorDialog.offsetWidth * 0.06;
			ctx.clearRect(0,0,hueBarArrowCanvas.width,hueBarArrowCanvas.height);
			ctx.beginPath();
			ctx.moveTo(0, yOffset);
			ctx.lineTo(hueBarArrowCanvas.width, yOffset - ARROW_HEIGHT/2);
			ctx.lineTo(hueBarArrowCanvas.width, yOffset + ARROW_HEIGHT/2);
			ctx.closePath();
			ctx.fillStyle = '#666666';
			ctx.fill();
			ctx.strokeStyle = '#cccccc';
			ctx.stroke();
		}
		hueBarUpdate(0);
		// set up saturation/brightness choosing box's display
		function satLightBoxUpdate(hue) {
			var STEP_SIZE = 2;
			var ctx = satLightBox.getContext('2d');
			for(var i = 0; i <= satLightBox.width; i += STEP_SIZE) {
				for(var j = 0; j <= satLightBox.height; j += STEP_SIZE) {
					var hue = hue,
						saturationPercent = i / satLightBox.width,
						brightnessPercent = (satLightBox.height-j) / satLightBox.height;
					ctx.fillStyle = hsvToRGBString(hue, saturationPercent, brightnessPercent);
					ctx.fillRect(i,j,STEP_SIZE,STEP_SIZE);
				}
			}
		}
		satLightBoxUpdate(0);
		hueBar.pixelArtMouseDown = false;
		function changeHue(event) {
			if(hueBar.pixelArtMouseDown) {
				var offset = getCursorOffset(event),
					newHue = (offset.y / (hueBar.height/AR))*360;
				if(newHue > 359) newHue = 359;
				else if(newHue < 0) newHue = 0;
				hueBarUpdate(newHue);
				satLightBoxUpdate(newHue);
			}
		}
		hueBar.addEventListener('mousedown', function(event) { hueBar.pixelArtMouseDown = true; changeHue(event); }, false);
		hueBar.addEventListener('mousemove', changeHue, false);
		window.addEventListener('mouseup', function() { hueBar.pixelArtMouseDown = false; }, false);
	}
	
	var TOP_OFFSET = 20, LEFT_OFFSET = 20;
	Window.call(this);
	this.colors = [ curColor, '#fafafa', '#0000FF', '#00FF00' ];
	this.updateNeeded = true;
	this.update();
	this.setPosition(TOP_OFFSET, window.innerWidth-LEFT_OFFSET-this.window.offsetWidth);
}
ColorPalette.prototype = Object.create(Window.prototype);

