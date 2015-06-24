/* Color conversion functions */

// converts R, G, B and A values to a string for efficient storage
function rgbaToChars(r, g, b, a) {
	return String.fromCharCode(r, g, b, a);
}

// converts char string back to R, G, B and A values
function charsToRGBA(chars) {
	return {
		r: chars.charCodeAt(0),
		g: chars.charCodeAt(1),
		b: chars.charCodeAt(2),
		a: chars.charCodeAt(3)
	}
}
