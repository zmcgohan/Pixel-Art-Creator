/* A Sprite is the main display component to be placed on the grid. It is composed of Frames representing its animation. These Frames are then composed of Layers, which allow for editing of independent areas of a Sprite. (Work on the legs, arms, etc. separately.)
 *
 * When a Sprite is edited, each of its Frames and Layers must be edited as well. (If the width/height grows/shrinks, each Layer's pixels array must be revised.)  */
function Sprite() {
	this.width = 0;
	this.height = 0;
	this.frames = [ new Frame() ];
	this.curFrameI = 0; // current frame index
}

Sprite.prototype.colorPixel = function(row, col, color) {
	var i, j,
		curFrame = this.frames[this.curFrameI],
		curLayer = curFrame.layers[curFrame.curLayerI];
	// sprite is currently empty -- create first pixel and return
	if(this.width === 0 && this.height === 0) {
		curLayer.pixels.push([color]);
		this.width = this.height = 1;
		return;
	}
	// resize if necessary
	if(col < 0) { // col is less than 0 (add cols in front)
		this.width += -col;
		for(i = 0; i < curLayer.pixels.length; ++i) {
			for(j = 0; j > col; --j) {
				curLayer.pixels[i].unshift('');
			}
		}
		col = 0;
	} else if(col > this.width-1) { // col is greater than current cols
		var widthDiff = col - (this.width-1);
		this.width += widthDiff;
		for(i = 0; i < curLayer.pixels.length; ++i) {
			for(j = 0; j < widthDiff; ++j) {
				curLayer.pixels[i].push('');
			}
		}
	}
	if(row < 0) { // row is above current rows
		this.height += -row;
		for(i = 0; i > row; --i) {
			var newRow = [];
			for(j = 0; j < this.width; ++j) {
				newRow.push('');
			}
			curLayer.pixels.unshift(newRow);
		}
		row = 0;
	} else if(row > this.height-1) { // row is below current rows
		var heightDiff = row - (this.height-1),
			newRow;
		this.height += heightDiff;
		for(i = 0; i < heightDiff; ++i) {
			newRow = [];
			for(j = 0; j < this.width; ++j) {
				newRow.push('');
			}
			curLayer.pixels.push(newRow);
		}
	}
	curLayer.pixels[row][col] = color;
}

Sprite.prototype.erasePixel = function(row, col) {
	var dimensionChanges = { top: 0, right: 0, bottom: 0, left: 0 };
	if(row >= 0 && row < this.height && col >= 0 && col < this.width) {
		var i, j,
			curFrame = this.frames[this.curFrameI],
			curLayer = curFrame.layers[curFrame.curLayerI];
		curLayer.pixels[row][col] = '';
		// remove each side if empty (trim the sprite)
		var oldWidth = this.width;
		leftSide:
		for(i = 0; i < oldWidth; ++i) {
			for(j = 0; j < this.height; ++j) {
				if(curLayer.pixels[j][0] !== '')
					break leftSide;
			}
			for(j = 0; j < this.height; ++j) {
				curLayer.pixels[j].splice(0, 1);
			}
			--this.width;
			++dimensionChanges.left;
		}
		rightSide:
		for(i = this.width-1; i >= 0; --i) {
			for(j = 0; j < this.height; ++j) {
				if(curLayer.pixels[j][i] !== '')
					break rightSide;
			}
			for(j = 0; j < this.height; ++j) {
				curLayer.pixels[j].splice(this.width-1, 1);
			}
			--this.width;
			++dimensionChanges.right;
		}
		var oldHeight = this.height;
		topSide:
		for(i = 0; i < oldHeight; ++i) {
			for(j = 0; j < this.width; ++j) {
				if(curLayer.pixels[0][j] !== '')
					break topSide;
			}
			curLayer.pixels.splice(0,1);
			--this.height;
			++dimensionChanges.top;
		}
		bottomSide:
		for(i = this.height-1; i >= 0; --i) {
			for(j = 0; j < this.width; ++j) {
				if(curLayer.pixels[i][j] !== '')
					break bottomSide;
			}
			curLayer.pixels.splice(i,1);
			--this.height;
			++dimensionChanges.bottom;
		}
	}
	return dimensionChanges;
}

function Frame() {
	this.layers = [ new Layer() ];
	this.curLayerI = 0; // current layer index
}

function Layer() {
	this.pixels = [];
}
