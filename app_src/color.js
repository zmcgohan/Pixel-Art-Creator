/* Represents a color. Allows for easy converting from/to formats. 
 *
 * Internally represented as HSV/HSB. */
function Color(h, s, v) {
	this.hue = h;
	this.saturation = s;
	this.value = v;
}

Color.prototype.getRGBString = function() {
	var rgb = this.getRGB();

	return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
}

Color.prototype.getRGB = function() {
	if(this.saturation < 0) this.saturation = 0;
	else if(this.saturation > 1.0) this.saturation = 1.0;
	if(this.value < 0) this.value = 0;
	else if(this.value > 1.0) this.value = 1.0;
	var chroma = this.value * this.saturation,
		huePrime = this.hue/60,
		x = chroma * (1 - Math.abs(huePrime % 2 - 1)),
		m = this.value - chroma;
		r = 0, g = 0, b = 0;
	if(0 <= huePrime && huePrime < 1) {
		r = chroma; g = x;
	} else if(1 <= huePrime && huePrime < 2) {
		r = x; g = chroma;
	} else if(2 <= huePrime && huePrime < 3) {
		g = chroma; b = x;
	} else if(3 <= huePrime && huePrime < 4) {
		g = x; b = chroma;
	} else if(4 <= huePrime && huePrime < 5) {
		r = x; b = chroma;
	} else if(5 <= huePrime && huePrime < 6) {
		r = chroma; b = x;
	}
	r += m; g += m; b += m;
	r *= 255; g *= 255; b *= 255;
	r = Math.ceil(r); g = Math.ceil(g); b = Math.ceil(b);

	return { r: r, g: g, b: b };
}

function getHSV() {
	return { h: this.hue, s: this.saturation, v: this.value };
}
