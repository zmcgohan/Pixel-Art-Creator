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

function hsvToRGB(hue, saturation, brightness) {
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

	return { r: r, g: g, b: b };
}

/*
function rgbToHSV(red, green, blue) {
	var colorMax, colorMin,
		colorDelta,
		hue, saturation, brightness;
	red = red / 255;
	green = green / 255;
	blue = blue / 255;
	colorMax = Math.max(red, green, blue);
	colorMin = Math.min(red, green, blue);
	colorDelta = colorMax - colorMin;
	// calculate hue
	if(colorDelta === 0) {
		hue = 0;
	} else if(colorMax === red) {
		hue = 60 * (((green - blue) / colorDelta) % 6);
	} else if(colorMax === green) {
		hue = 60 * (((blue - red) / colorDelta) + 2);
	} else if(colorMax === blue) {
		hue = 60 * (((red - green) / colorDelta) + 4);
	} 
	// calculate saturation
	if(colorMax === 0) {
		saturation = 0;
	} else {
		saturation = colorDelta / colorMax;
	}
	// brightness = colorMax
	brightness = colorMax;

	return { h: Math.round(hue), s: Math.round(saturation), v: Math.round(brightness) };
}
*/

/* Converts RGB values to corresponding HSV. 
 *
 * Taken from http://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript */
// TODO write my own function -- apparently commercial code under CC isn't allowed
// doesn't appear to work in some circumstances (#FF0001/#FF0002 as examples)
function rgbToHSV() {
	var rr, gg, bb,
		r = arguments[0] / 255,
		g = arguments[1] / 255,
		b = arguments[2] / 255,
		h, s,
		v = Math.max(r, g, b),
		diff = v - Math.min(r, g, b),
		diffc = function(c){
			return (v - c) / 6 / diff + 1 / 2;
		};

	if (diff == 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rr = diffc(r);
		gg = diffc(g);
		bb = diffc(b);

		if (r === v) {
			h = bb - gg;
		}else if (g === v) {
			h = (1 / 3) + rr - bb;
		}else if (b === v) {
			h = (2 / 3) + gg - rr;
		}
		if (h < 0) {
			h += 1;
		}else if (h > 1) {
			h -= 1;
		}
	}
	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		v: Math.round(v * 100)
	};
}

// gets the cursor offset coordinates inside of an element from a mouse event
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

// returns an array containing only unrepeated sprites from spriteArray, which contains both sprites and positions
function getUnrepeatedSprites(spriteArray) {
	var unrepeatedSprites = [],
		i, j,
		alreadyInArray = false;
	for(i = 0; i < spriteArray.length; ++i) {
		alreadyInArray = false;
		for(j = 0; j < unrepeatedSprites.length; ++j) {
			if(unrepeatedSprites[j] === spriteArray[i].sprite) {
				alreadyInArray = true;
				break;
			}
		}
		if(!alreadyInArray) unrepeatedSprites.push(spriteArray[i].sprite);
	}
	return unrepeatedSprites;
}

// gets the closest parent of elem with the id parentId
function getParentWithId(elem, parentId) {
	while(!elem.className || elem.className.indexOf(parentId) < 0) elem = elem.parentNode;
	return elem;
}
