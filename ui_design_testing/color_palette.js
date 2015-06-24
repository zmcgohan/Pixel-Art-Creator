var DEFAULT_COLORS = [ '#ff0000', '#00ff00', '#0000ff' ];
	
function ColorPalette() {
	this.colors = DEFAULT_COLORS;
	this.curColorI = 0;

	this.window = document.getElementById('colorPalette');
	this.colorSlidesContainer = document.getElementById('colorSlidesContainer');
}

ColorPalette.prototype.addColor = function(newColor) {
	this.colors.push(newColor);
}

ColorPalette.prototype.render = function() {
	for(var i = 0; i < this.colors.length; ++i) {
		var colorSlide = document.createElement('span');
		colorSlide.className = 'colorSlide';
		colorSlide.style.background = this.colors[i];
		this.colorSlidesContainer.appendChild(colorSlide);
	}
}

var cp = new ColorPalette();
cp.addColor('#00ffff');
cp.render();
