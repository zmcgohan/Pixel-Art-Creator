function ColorPicker(hue, saturation, brightness) {
	this.hue = hue;
	this.saturation = saturation;
	this.brightness = brightness;
	this.ctx = document.getElementById('colorPickerCanvas').getContext('2d');
}
