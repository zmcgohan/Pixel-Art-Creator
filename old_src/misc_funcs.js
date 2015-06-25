/* Utility functions (that don't fit with one single class) */

function setUp() {
	// set up canvas and add to body
	canvas = document.getElementById('mainCanvas');
	updatePositionsAndSizes();
	// set 2D context
	ctx = canvas.getContext('2d');
}

function updatePositionsAndSizes() {
	var i,
		canvases = document.getElementsByTagName('canvas');
	// resize main canvas
	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';
	// set the width/height of canvases based on aspect ratio (AR)
	for(i = 0; i < canvases.length; ++i) {
		canvases[i].width = parseInt(window.getComputedStyle(canvases[i]).getPropertyValue('width')) * AR;
		canvases[i].height = parseInt(window.getComputedStyle(canvases[i]).getPropertyValue('height')) * AR;
	}
}

/* Converts HSV values to a string representing RGB. Requires 0 <= hue < 360, 0 <= saturation <= 1.0 and 0 <= brightness <= 1.0. 
 *
 * Ex. hsbToRGBString(0,1.0,1.0) returns 'rgb(255,0,0)' */
function hsvToRGBString(hue, saturation, brightness) {
	if(saturation < 0) saturation = 0;
	else if(saturation > 1.0) saturation = 1.0;
	if(brightness < 0) brightness = 0;
	else if(brightness > 1.0) brightness = 1.0;
	var chroma = brightness * saturation,
		huePrime = hue/60,
		x = chroma * (1 - Math.abs(huePrime % 2 - 1)),
		m = brightness - chroma;
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

	return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function getCursorOffset(evt) {
	var el = evt.target,
		x = 0,
		y = 0;

	while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
		x += el.offsetLeft - el.scrollLeft;
		y += el.offsetTop - el.scrollTop;
		el = el.offsetParent;
	}

	x = evt.clientX - x;
	y = evt.clientY - y;

	return { x: x, y: y };
}

function vmaxToPx(vmax) {
	var onePercent = window.innerWidth > window.innerHeight ? window.innerWidth / 100 : window.innerHeight / 100;
	return onePercent * vmax;
}
