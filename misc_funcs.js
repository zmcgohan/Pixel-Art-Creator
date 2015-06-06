/* Miscellaneous functions */

function setUp() {
	// set up canvas and add to body
	canvas = document.createElement("canvas");
	canvas.width = window.innerWidth * AR;
	canvas.height = window.innerHeight * AR;
	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';
	document.body.appendChild(canvas);
	// set 2D context
	ctx = canvas.getContext('2d');
}

function updateScreen() {
	for(var i = 0; i < windows.length; ++i) {
		windows[i].update();
	}
	mainGrid.render();
}

function hsvToRGBString(hue, saturation, brightness) {
	if(!(0 <= saturation && saturation <= 1)) 
		throw "Saturation must be in the range [0, 1]."
	if(!(0 <= brightness && brightness <= 1))
		throw "Brightness must be in the range [0, 1]."
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
