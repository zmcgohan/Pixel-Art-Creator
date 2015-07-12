/* A Sprite is the main display component to be placed on the grid. It is composed of Frames representing its animation. These Frames are then composed of Layers, which allow for editing of independent areas of a Sprite. (Work on the legs, arms, etc. separately.)
 *
 * When a Sprite is edited, each of its Frames and Layers must be edited as well. (If the width/height grows/shrinks, each Layer's pixels array must be revised.)  */

var SpriteSide = { TOP: 0, RIGHT: 1, BOTTOM: 2, LEFT: 3 };

var SPRITE_DEFAULT_BG_COLOR = '#fdfdfd';

function Sprite() {
	this.width = 0;
	this.height = 0;
	this.frames = [ new Frame() ];
	this.curFrameI = 0; // current frame index
	this.curLayerI = 0; // current layer index
	this.dimensionsLocked = false; // true = sprite will resize when pixels out of current dimensions are added
}

// calls func(layer) on all frames and their layers
// TODO not currently used -- but should be implemented
Sprite.prototype.affectAllLayers = function(func) {
	var numLayers = this.frames[0].layers.length;
	for(var frameI = 0; frameI < this.frames.length; ++frameI) {
		for(var layerI = 0; layerI < numLayers; ++layerI) {
			func(this.frames[frameI].layers[layerI]);
		}
	}
}

// adds pixel to specified side (which is a value of SpriteSide)
Sprite.prototype.addPixels = function(side, numPixels) {
	if(numPixels <= 0) return;
	var frame, layer, row, col;
	var addPixels = (function() {
		switch(side) {
			case SpriteSide.TOP:
				return function(sprite, frame, layer) {
					for(row = 0; row < numPixels; ++row) {
						var newRow = [];
						for(col = 0; col < sprite.width; ++col) {
							newRow.push('');
						}
						sprite.frames[frame].layers[layer].pixels.unshift(newRow);
					}
				}
				break;
			case SpriteSide.RIGHT:
				return function(sprite, frame, layer) {
					for(row = 0; row < sprite.frames[frame].layers[layer].pixels.length; ++row) {
						for(col = 0; col < numPixels; ++col) {
							sprite.frames[frame].layers[layer].pixels[row].push('');
						}
					}
				}
				break;
			case SpriteSide.BOTTOM:
				return function(sprite, frame, layer) {
					for(row = 0; row < numPixels; ++row) {
						var newRow = [];
						for(col = 0; col < sprite.width; ++col) {
							newRow.push('');
						}
						sprite.frames[frame].layers[layer].pixels.push(newRow);
					}
				}
				break;
			case SpriteSide.LEFT:
				return function(sprite, frame, layer) {
					for(row = 0; row < sprite.frames[frame].layers[layer].pixels.length; ++row) {
						for(col = 0; col < numPixels; ++col) {
							sprite.frames[frame].layers[layer].pixels[row].unshift('');
						}
					}
				}
				break;
		}
	})();
	for(frame = 0; frame < this.frames.length; ++frame) {
		for(layer = 0; layer < this.frames[frame].layers.length; ++layer) {
			addPixels(this, frame, layer);
		}
	}
	switch(side) {
		case SpriteSide.TOP:
		case SpriteSide.BOTTOM:
			this.height += numPixels;
			break;
		case SpriteSide.RIGHT:
		case SpriteSide.LEFT:
			this.width += numPixels;
			break;
	}
}

Sprite.prototype.removePixels = function(side, numPixels) {
	if(numPixels <= 0) return;
	var frame, layer, row, col;
	var removePixels = (function() {
		switch(side) {
			case SpriteSide.TOP:
				return function(sprite, frame, layer) {
					sprite.frames[frame].layers[layer].pixels.splice(0, numPixels);
				}
				break;
			case SpriteSide.RIGHT:
				return function(sprite, frame, layer) {
					for(row = 0; row < sprite.frames[frame].layers[layer].pixels.length; ++row) {
						sprite.frames[frame].layers[layer].pixels[row].splice(sprite.width-numPixels, numPixels);
					}
				}
				break;
			case SpriteSide.BOTTOM:
				return function(sprite, frame, layer) {
					sprite.frames[frame].layers[layer].pixels.splice(sprite.height-numPixels, numPixels);
				}
				break;
			case SpriteSide.LEFT:
				return function(sprite, frame, layer) {
					for(row = 0; row < sprite.frames[frame].layers[layer].pixels.length; ++row) {
						sprite.frames[frame].layers[layer].pixels[row].splice(0, numPixels);
					}
				}
				break;
		}
	})();
	for(frame = 0; frame < this.frames.length; ++frame) {
		for(layer = 0; layer < this.frames[frame].layers.length; ++layer) {
			removePixels(this, frame, layer);
		}
	}
	switch(side) {
		case SpriteSide.TOP:
		case SpriteSide.BOTTOM:
			this.height -= numPixels;
			break;
		case SpriteSide.RIGHT:
		case SpriteSide.LEFT:
			this.width -= numPixels;
			break;
	}
}

// adds a new frame to sprite
Sprite.prototype.addFrame = function() {
	var newFrame = new Frame();
	newFrame.layers[0].initPixels(this.height, this.width);
	newFrame.layers[0].title = this.frames[0].layers[0].title;
	for(var i = 1; i < this.frames[0].layers.length; ++i) {
		var newLayer = new Layer();
		newLayer.initPixels(this.height, this.width);
		newLayer.title = this.frames[0].layers[i].title;
		newFrame.layers.push(newLayer);
	}
	this.frames.push(newFrame);
}

// adds a new layer to sprite
Sprite.prototype.addLayer = function() {
	for(var frameI = 0; frameI < this.frames.length; ++frameI) {
		this.frames[frameI].layers.push(new Layer());
		this.frames[frameI].layers[this.frames[frameI].layers.length-1].initPixels(this.height, this.width);
	}
}

// gets the pixel at specified row and col of current frame/layer
Sprite.prototype.getPixel = function(row, col, frame) {
	if(frame === undefined) frame = this.curFrameI;
	var curFrame = this.frames[frame],
		curLayer,
		pxColor = undefined;
	for(var layerI = 0; layerI < curFrame.layers.length; ++layerI) {
		curLayer = curFrame.layers[layerI];
		if(curLayer.pixels[row] !== undefined && curLayer.pixels[row][col] !== undefined) {
			pxColor = curLayer.visible ? curLayer.pixels[row][col] : ''; // if curLayer isn't visible, blank cell (rather than undefined)
			if(pxColor !== '') break;
		}
	}
	return pxColor;
}

Sprite.prototype.colorPixel = function(row, col, color) {
	// if dimensions are locked, just return
	if((col < 0 || col > this.width-1 || row < 0 || row > this.height-1) && this.dimensionsLocked)
		return undefined;
	var i, j,
		curFrame = this.frames[this.curFrameI],
		curLayer = curFrame.layers[this.curLayerI];
	// if current layer isn't visible, don't draw anything
	// TODO double-check this doesn't break anything. Seems too simple. I'm tired
	if(!curLayer.visible) return undefined;
	// sprite is currently empty -- create first pixel and return
	if(this.width === 0) {
		// push pixel to all layers
		for(var frameI = 0; frameI < this.frames.length; ++frameI) {
			for(var layerI = 0; layerI < this.frames[0].layers.length; ++layerI) {
				if(this.frames[frameI].layers[layerI] !== curLayer) this.frames[frameI].layers[layerI].pixels.push(['']);
				else curLayer.pixels.push([color]);
			}
		}
		this.width = this.height = 1;
		updateScreen();
		return;
	}
	// resize if necessary
	var frameI, layerI, rowI, colI;
	if(col < 0) { // col is less than 0 (add cols in front)
		this.addPixels(SpriteSide.LEFT, -col);
		col = 0;
	} else if(col > this.width-1) { // col is greater than current cols
		var widthDiff = col - (this.width-1);
		this.addPixels(SpriteSide.RIGHT, widthDiff);
	}
	if(row < 0) { // row is above current rows
		this.addPixels(SpriteSide.TOP, -row);
		row = 0;
	} else if(row > this.height-1) { // row is below current rows
		var heightDiff = row - (this.height-1),
			newRow;
		this.addPixels(SpriteSide.BOTTOM, heightDiff);
	}
	curLayer.pixels[row][col] = color;
	updateScreen();
	return true;
}

Sprite.prototype.erasePixel = function(row, col) {
	var dimensionChanges = { top: 0, right: 0, bottom: 0, left: 0 };
	// make sure the affected row and col is actually a part of the sprite
	if(row >= 0 && row < this.height && col >= 0 && col < this.width) {
		var curFrame = this.frames[this.curFrameI],
			curLayer = curFrame.layers[this.curLayerI];
		// clear pixel
		curLayer.pixels[row][col] = '';
		dimensionChanges = this.trimSize();
	}
	updateScreen();
	return dimensionChanges;
}

// TODO this is huge. Too huge. And very repeated.
Sprite.prototype.trimSize = function() {
	var dimensionChanges = { top: 0, right: 0, bottom: 0, left: 0 };
	// if dimensions are locked, no trimming
	if(this.dimensionsLocked)
		return dimensionChanges;
	var i, j,
		curFrame = this.frames[this.curFrameI],
		curLayer = curFrame.layers[this.curLayerI];
	// remove each side if empty (trim the sprite)
	var oldWidth = this.width;
	leftSide:
	for(i = 0; i < oldWidth; ++i) {
		for(var curFrameI = 0; curFrameI < this.frames.length; ++curFrameI) {
			curFrame = this.frames[curFrameI];
			for(var curLayerI = 0; curLayerI < curFrame.layers.length; ++curLayerI) {
				curLayer = curFrame.layers[curLayerI];
				for(j = 0; j < this.height; ++j) {
					if(curLayer.pixels[j][0] !== '')
						break leftSide;
				}
			}
		}
		for(var curFrameI = 0; curFrameI < this.frames.length; ++curFrameI) {
			curFrame = this.frames[curFrameI];
			for(var curLayerI = 0; curLayerI < curFrame.layers.length; ++curLayerI) {
				curLayer = curFrame.layers[curLayerI];
				for(j = 0; j < this.height; ++j) {
					curLayer.pixels[j].splice(0, 1);
				}
			}
		}
		--this.width;
		++dimensionChanges.left;
	}
	rightSide:
	for(i = this.width-1; i >= 0; --i) {
		for(var curFrameI = 0; curFrameI < this.frames.length; ++curFrameI) {
			curFrame = this.frames[curFrameI];
			for(var curLayerI = 0; curLayerI < curFrame.layers.length; ++curLayerI) {
				curLayer = curFrame.layers[curLayerI];
				for(j = 0; j < this.height; ++j) {
					if(curLayer.pixels[j][i] !== '')
						break rightSide;
				}
			}
		}
		for(var curFrameI = 0; curFrameI < this.frames.length; ++curFrameI) {
			curFrame = this.frames[curFrameI];
			for(var curLayerI = 0; curLayerI < curFrame.layers.length; ++curLayerI) {
				curLayer = curFrame.layers[curLayerI];
				for(j = 0; j < this.height; ++j) {
					curLayer.pixels[j].splice(this.width-1, 1);
				}
			}
		}
		--this.width;
		++dimensionChanges.right;
	}
	var oldHeight = this.height;
	topSide:
	for(i = 0; i < oldHeight; ++i) {
		for(var curFrameI = 0; curFrameI < this.frames.length; ++curFrameI) {
			curFrame = this.frames[curFrameI];
			for(var curLayerI = 0; curLayerI < curFrame.layers.length; ++curLayerI) {
				curLayer = curFrame.layers[curLayerI];
				for(j = 0; j < this.width; ++j) {
					if(curLayer.pixels[0][j] !== '')
						break topSide;
				}
			}
		}
		for(var curFrameI = 0; curFrameI < this.frames.length; ++curFrameI) {
			curFrame = this.frames[curFrameI];
			for(var curLayerI = 0; curLayerI < curFrame.layers.length; ++curLayerI) {
				curLayer = curFrame.layers[curLayerI];
				curLayer.pixels.splice(0,1);
			}
		}
		--this.height;
		++dimensionChanges.top;
	}
	bottomSide:
	for(i = this.height-1; i >= 0; --i) {
		for(var curFrameI = 0; curFrameI < this.frames.length; ++curFrameI) {
			curFrame = this.frames[curFrameI];
			for(var curLayerI = 0; curLayerI < curFrame.layers.length; ++curLayerI) {
				curLayer = curFrame.layers[curLayerI];
				for(j = 0; j < this.width; ++j) {
					if(curLayer.pixels[i][j] !== '')
						break bottomSide;
				}
			}
		}
		for(var curFrameI = 0; curFrameI < this.frames.length; ++curFrameI) {
			curFrame = this.frames[curFrameI];
			for(var curLayerI = 0; curLayerI < curFrame.layers.length; ++curLayerI) {
				curLayer = curFrame.layers[curLayerI];
				curLayer.pixels.splice(i,1);
			}
		}
		--this.height;
		++dimensionChanges.bottom;
	}
	updateScreen();
	return dimensionChanges;
}

/* Resizes the Sprite to numCols x numRows. 
 *
 * When reducing size, simply cuts off needed pixels. When increasing, simply adds blank ('') pixels. */
Sprite.prototype.resize = function(numRows, numCols) {
	// TODO change with this.addPixels() and this.removePixels()
	var frameI, layerI, i, j,
		widthDiff = Math.abs(this.width - numCols),
		heightDiff = Math.abs(this.height - numRows);

	var layer;
	for(frameI = 0; frameI < this.frames.length; ++frameI) {
		for(layerI = 0; layerI < this.frames[frameI].layers.length; ++layerI) {
			layer = this.frames[frameI].layers[layerI];

			if(numRows < this.height) { // decreasing height -- remove rows
				layer.pixels.splice(this.height-heightDiff, heightDiff);
			} else if(numRows > this.height) { // increasing height -- add blank rows
				for(i = 0; i < heightDiff; ++i) {
					layer.pixels.push([]);
					for(j = 0; j < this.width; ++j) {
						layer.pixels[layer.pixels.length-1].push('');
					}	
				}
			}
			
			if(numCols < this.width) { // reducing width -- remove pixels from each row
				for(i = 0; i < layer.pixels.length; ++i) {
					layer.pixels[i].splice(this.width-widthDiff, widthDiff);
				}
			} else if(numCols > this.width) { // increasing width -- add blank pixels to each row
				for(i = 0; i < layer.pixels.length; ++i) {
					for(j = 0; j < widthDiff; ++j) {
						layer.pixels[i].push('');
					}
				}
			}
		}
	}
	this.width = this.frames[0].layers[0].pixels[0].length;
	this.height = this.frames[0].layers[0].pixels.length;
	updateScreen();
}

Sprite.prototype.switchLayers = function(layerOne, layerTwo) {
	for(var frameI = 0; frameI < this.frames.length; ++frameI) {
		var tempRef = this.frames[frameI].layers[layerTwo];
		this.frames[frameI].layers[layerTwo] = this.frames[frameI].layers[layerOne];
		this.frames[frameI].layers[layerOne] = tempRef;
	}
	if(this.curLayerI === layerOne) {
		this.curLayerI = layerTwo;
	} else if(this.curLayerI === layerTwo) {
		this.curLayerI = layerOne;
	}
}

Sprite.prototype.hideLayer = function(layerI) {
	for(var frameI = 0; frameI < this.frames.length; ++frameI) {
		this.frames[frameI].layers[layerI].visible = false;
	}
}

Sprite.prototype.showLayer = function(layerI) {
	for(var frameI = 0; frameI < this.frames.length; ++frameI) {
		this.frames[frameI].layers[layerI].visible = true;
	}
}

// renders frame index frameI of sprite onto ctx starting at startXPos, startYPos with each pixel being pixelWidth pxs wide
// if bgVisible isn't specified, === false -- no background drawn
Sprite.prototype.render = function(ctx, frameI, startXPos, startYPos, pixelWidth, bgVisible) {
	bgVisible = bgVisible || false;
	var layerI, row, col,
		curLayer,
		curPxColor,
		drawPxWidth = Math.ceil(pixelWidth);
	//pixelWidth = Math.ceil(pixelWidth);
	for(row = 0; row < this.height; ++row) {
		for(col = 0; col < this.width; ++col) {
			curPxColor = '';
			for(layerI = 0; layerI < this.frames[frameI].layers.length; ++layerI) {
				curLayer = this.frames[frameI].layers[layerI];
				if(!curLayer.visible) continue; // layer hidden? don't worry about it
				if(curLayer.pixels[row][col] !== '') {
					curPxColor = curLayer.pixels[row][col];
					break;
				}
			}
			if(curPxColor !== '') {
				ctx.fillStyle = curPxColor;
				ctx.fillRect(Math.floor(startXPos + col * pixelWidth), Math.floor(startYPos + row * pixelWidth),
						drawPxWidth, drawPxWidth);
			} else if(bgVisible) { // bg is visible -- draw it
				ctx.fillStyle = SPRITE_DEFAULT_BG_COLOR;
				ctx.fillRect(Math.floor(startXPos + col * pixelWidth), Math.floor(startYPos + row * pixelWidth),
						drawPxWidth, drawPxWidth);
			}
		}
	}
}

// changes a layer's title across all frames
Sprite.prototype.setLayerTitle = function(layerI, newTitle) {
	var frameI;
	for(frameI = 0; frameI < this.frames.length; ++frameI) {
		this.frames[frameI].layers[layerI].title = newTitle;
	}
}

function Frame() {
	this.layers = [ new Layer() ];
}

function Layer() {
	this.pixels = [];
	this.visible = true;
	this.title = 'New Layer';
}

// initializes this.pixels to an empty array ('' pixels) of size cols x rows
Layer.prototype.initPixels = function(rows, cols) {
	var row, col;
	this.pixels = [];
	for(row = 0; row < rows; ++row) {
		this.pixels.push([]);
		for(col = 0; col < cols; ++col) {
			this.pixels[row].push('');
		}
	}
}
