'use strict';

var AR = 2, // aspect ratio
	DEFAULT_BG_COLOR = '#fafafa',
	DEFAULT_LINE_COLOR = '#aaaaaa',
	DEFAULT_ACTIVE_CELL_COLOR = '#888888',
	DEFAULT_ACTIVE_CELL_ALPHA = 0.3,
	SPRITE_BG_COLOR = '#fdfdfd',
	MIN_SCREEN_WIDTH = 300;

var canvas, ctx, mainGrid;

var windows = [];

var curTool = Tools.PEN,
	curColor = '#0000FF';

var mouseDown = false;

/* EXECUTION SECTION */

setUp();
mainGrid = new Grid();

mainGrid.render();

/* CLASS SECTION */

function Grid() {
	this.curSprite = undefined; // current sprite being edited
	this.bgSprites = undefined; // bg sprites (onion-skinning)
	this.topLeftViewPos = { x: 0, y: 0 }; // top left view position (in pixels)
	this.lineColor = DEFAULT_LINE_COLOR; // color of cell separation lines
	this.bgColors = [ DEFAULT_BG_COLOR, '#dedede' ]; // color of background cells
	this.numCols = Math.floor(10 + (canvas.width - MIN_SCREEN_WIDTH) / 100);
	this.numRows = Math.floor((canvas.height / canvas.width) * this.numCols);
	this.cellWidth = canvas.width / this.numCols;
	this.cellHeight = canvas.height / this.numRows;
	this.activeCell = { x: undefined, y: undefined };
	this.activeCellColor = DEFAULT_ACTIVE_CELL_COLOR;
	this.activeCellAlpha = DEFAULT_ACTIVE_CELL_ALPHA;
	this.recalculateNumCells = function() {
		this.numCols = Math.ceil(canvas.width / this.cellWidth);
		this.numRows = Math.ceil(canvas.height / this.cellHeight);
	}
	this.getCellAtPos = function(x, y) {
		return { x: Math.floor(x / this.cellWidth),
				 y: Math.floor(y / this.cellHeight) };
	}
	this.render = function() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		var i, j,
			pxDiffX = this.topLeftViewPos.x % this.cellWidth,
			pxDiffY = this.topLeftViewPos.y % this.cellHeight,
			topLeftCellX = Math.floor((this.topLeftViewPos.x) / this.cellWidth),
			topLeftCellY = Math.floor((this.topLeftViewPos.y) / this.cellHeight);
		// draw visible cells
		for(i = 0; i < this.numRows+1; ++i) {
			for(j = 0; j < this.numCols+1; ++j) {
				var drawXPos, drawYPos;
				// if x difference is negative, have to compensate
				if(pxDiffX >= 0) drawXPos = j*this.cellWidth-pxDiffX;
				else drawXPos = j*this.cellWidth-(this.cellWidth+pxDiffX);
				// same with y difference
				if(pxDiffY >= 0) drawYPos = i*this.cellHeight-pxDiffY;
				else drawYPos = i*this.cellHeight-(this.cellHeight+pxDiffY);
				// TODO: make the following sprite rendering more efficient.. because it's not. at all.
				// render current sprite
				var spriteCellColor = undefined;
				if(this.curSprite !== undefined && this.curSprite.pos.x <= topLeftCellX+j && this.curSprite.pos.x+this.curSprite.sprite.width >= topLeftCellX && this.curSprite.pos.y <= topLeftCellY+i && this.curSprite.pos.y+this.curSprite.sprite.height >= topLeftCellY) {
					var spritePxRow = (topLeftCellY+i)-this.curSprite.pos.y,
						spritePxCol = (topLeftCellX+j)-this.curSprite.pos.x;
					if(this.curSprite.sprite.frames[0].layers[0].pixels[spritePxRow] !== undefined && this.curSprite.sprite.frames[0].layers[0].pixels[spritePxRow][spritePxCol] !== undefined)
						spriteCellColor = this.curSprite.sprite.frames[0].layers[0].pixels[spritePxRow][spritePxCol];
				}
				if(spriteCellColor !== undefined) { // sprite cell found -- draw it
					if(spriteCellColor !== '') ctx.fillStyle = spriteCellColor;
					else ctx.fillStyle = SPRITE_BG_COLOR;
					ctx.fillRect(drawXPos, drawYPos, this.cellWidth, this.cellHeight);
				} else { // empty cell -- default bg color
					// calculate background color -- different if in negative cells
					if(topLeftCellX+j >= 0 && topLeftCellY+i >= 0) ctx.fillStyle = this.bgColors[(topLeftCellX+topLeftCellY+i+j)%this.bgColors.length];
					else {
						var xAdd = topLeftCellX+j >= 0 ? topLeftCellX : this.bgColors.length + (topLeftCellX % this.bgColors.length);
						var yAdd = topLeftCellY+i >= 0 ? topLeftCellY : this.bgColors.length + (topLeftCellY % this.bgColors.length);
						ctx.fillStyle = this.bgColors[(xAdd+yAdd+i+j)%this.bgColors.length];
					}
					ctx.fillRect(drawXPos, drawYPos, this.cellWidth, this.cellHeight);
				}
				// if active cell, shade it
				if(topLeftCellX+j === this.activeCell.x && topLeftCellY+i === this.activeCell.y) {
					ctx.globalAlpha = this.activeCellAlpha;
					ctx.fillStyle = this.activeCellColor;
					ctx.fillRect(drawXPos, drawYPos, this.cellWidth, this.cellHeight);
					ctx.globalAlpha = 1.0;
				}
			}
		}
		// draw grid lines
		ctx.strokeStyle = this.lineColor;
		for(i = 0; i <= this.numCols; ++i) {
			var xPos = Math.floor(this.cellWidth * i - pxDiffX);
			ctx.beginPath();
			ctx.moveTo(xPos, 0);
			ctx.lineTo(xPos, canvas.height);
			ctx.closePath();
			ctx.stroke();
		}
		for(i = 0; i <= this.numRows; ++i) {
			var yPos = Math.floor(this.cellHeight * i - pxDiffY);
			ctx.beginPath();
			ctx.moveTo(0, yPos);
			ctx.lineTo(canvas.width, yPos);
			ctx.closePath();
			ctx.stroke();
		}
	}
}

/* A Sprite is the main display component to be placed on the grid. It is composed of Frames representing its animation. These Frames are then composed of Layers, which allow for editing of independent areas of a Sprite. (Work on the legs, arms, etc. separately.)
 *
 * When a Sprite is edited, each of its Frames and Layers must be edited as well. (If the width/height grows/shrinks, each Layer's pixels array must be revised.)  */
function Sprite() {
	this.width = 0;
	this.height = 0;
	this.frames = [ new Frame() ];
	this.curFrameI = 0; // current frame index
	this.colorPixel = function(row, col, color) {
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
	this.erasePixel = function(row, col) {
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
}

function Frame() {
	this.layers = [ new Layer() ];
	this.curLayerI = 0; // current layer index
}

function Layer() {
	this.pixels = [];
}

function Window() {
	this.window = document.createElement('div');
	this.setPosition(50,50);
	document.body.appendChild(this.window);
	// drag support -- ondrag is.. iffy at best
	this.mouseDown = false;
	this.lastMousePos = { x: undefined, y: undefined };
	this.dragged = false;
	this.mouseDownListener = function(event) {
		if(event.target === this.window || event.target.parentNode === this.window) {
			this.mouseDown = true;
			this.lastMousePos = { x: event.x, y: event.y };
			this.dragged = false;
		}
	}
	window.addEventListener('mousedown', this.mouseDownListener.bind(this), false);
	this.mouseUpListener = function(event) {
		this.mouseDown = false;
	}
	window.addEventListener('mouseup', this.mouseUpListener.bind(this), false);
	this.mouseMoveListener = function(event) {
		if(this.mouseDown) {
			var newLeft = parseInt(this.window.style.left, 10) + (event.x - this.lastMousePos.x),
				newTop = parseInt(this.window.style.top, 10) + (event.y - this.lastMousePos.y);
			this.setPosition(newTop, newLeft);
			this.lastMousePos = { x: event.x, y: event.y };
			this.dragged = true;
		}
	}
	window.addEventListener('mousemove', this.mouseMoveListener.bind(this), false);
}
Window.prototype = {
	resize: function(width, height) {
		this.window.style.width = width + 'px';
		this.window.style.height = height + 'px';
	},
	
	setPosition: function(top, left) {
		// make sure window doesn't go outside viewable area
		if(top < 5) top = 5;
		else if(top + this.window.offsetHeight > window.innerHeight - 5) top = window.innerHeight - 5 - this.window.offsetHeight;
		if(left < 5) left = 5;
		else if(left + this.window.offsetWidth > window.innerWidth - 5) left = window.innerWidth - 5 - this.window.offsetWidth;
		// set new top and left positions
		this.window.style.top = top + 'px';
		this.window.style.left = left + 'px';
	}
};

function ColorPalette() {
	this.update = function() {
		var slideWidth = MIN_SCREEN_WIDTH / 8 + (canvas.width-MIN_SCREEN_WIDTH) / 300,
			TOP_OFFSET = 30;

		// remove current children
		while(this.window.firstChild) this.window.removeChild(this.window.firstChild);
		var i, newSlide;
		// add each color slide, set its style properties and events
		for(i = 0; i < this.colors.length; ++i) {
			newSlide = document.createElement('div');
			newSlide.style.background = this.colors[i];
			newSlide.style.position = 'relative';
			newSlide.style.display = 'inline-block';
			newSlide.style.width = slideWidth + 'px';
			newSlide.style.height = slideWidth / (mainGrid.cellHeight / mainGrid.cellWidth) + 'px';
			newSlide.style.marginRight = '5px';
			this.window.appendChild(newSlide);
			var slideClickListener = function(event) {
				if(!this.dragged) {
					curColor = event.target.style.background; 
					console.log('New color: ' + curColor);
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
		// TODO make "Add Color" events & functionality
		this.window.appendChild(newSlide);
		this.setPosition(TOP_OFFSET, window.innerWidth / 2 - this.window.offsetWidth / 2);
	}

	Window.call(this);
	this.colors = [ '#FF0000', '#00FF00', '#0000FF' ];
}
ColorPalette.prototype = Object.create(Window.prototype);

function ToolBox() {
	this.update = function() {

	}

	Window.call(this);
}
ToolBox.prototype = Object.create(Window.prototype);

/* FUNCTION SECTION */

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

/* EVENT HANDLERS */

window.addEventListener("resize", function(event) {
	canvas.width = window.innerWidth * AR;
	canvas.height = window.innerHeight * AR;
	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';
	mainGrid.recalculateNumCells();
	updateScreen();
}, false);

// moving around the grid and zooming in/out
window.addEventListener("mousewheel", function(event) {
	if(!event.ctrlKey) { // basic scrolling (moves grid)
		mainGrid.topLeftViewPos.x -= event.wheelDeltaX;
		mainGrid.topLeftViewPos.y -= event.wheelDeltaY;
		mainGrid.render();
	} else { // Chrome sets ctrlKey flag for pinching -- zoom grid
		var MIN_CELL_WIDTH = 30 + Math.abs(canvas.width-MIN_SCREEN_WIDTH) / 150,
			MAX_CELL_WIDTH = canvas.width / 3,
			widthHeightRatio = mainGrid.cellHeight / mainGrid.cellWidth,
			zoomAmount = event.deltaY,
		 	gridPosRatioX = mainGrid.topLeftViewPos.x / mainGrid.cellWidth,
			xCursorRatio = event.x*AR / mainGrid.cellWidth,
			gridPosRatioY = mainGrid.topLeftViewPos.y / mainGrid.cellHeight,
			yCursorRatio = event.y*AR / mainGrid.cellHeight;
		// prevent default behavior
		event.preventDefault();
		event.stopImmediatePropagation();
		// scale grid's cell width and cell height
		mainGrid.cellWidth -= zoomAmount;
		if(mainGrid.cellWidth < MIN_CELL_WIDTH) mainGrid.cellWidth = MIN_CELL_WIDTH;
		else if(mainGrid.cellWidth > MAX_CELL_WIDTH) mainGrid.cellWidth = MAX_CELL_WIDTH;
		mainGrid.cellHeight = mainGrid.cellWidth * widthHeightRatio;
		mainGrid.recalculateNumCells();
		// keep cursor at same pixel (if not at min or max -- then it just moves the grid)
		if(mainGrid.cellWidth !== MIN_CELL_WIDTH && mainGrid.cellWidth !== MAX_CELL_WIDTH) {
			mainGrid.topLeftViewPos.x = gridPosRatioX * mainGrid.cellWidth - xCursorRatio*zoomAmount;
			mainGrid.topLeftViewPos.y = gridPosRatioY * mainGrid.cellHeight - yCursorRatio*zoomAmount;
		}
		mainGrid.render();
	}
}, false);

// highlight moused-over cell
canvas.addEventListener("mousemove", function(event) {
	mainGrid.activeCell = mainGrid.getCellAtPos(mainGrid.topLeftViewPos.x+event.x*AR, mainGrid.topLeftViewPos.y+event.y*AR);

	curTool.handleEvent(event);

	mainGrid.render();
}, false);

// handle mouse button being depressed
canvas.addEventListener("mousedown", function(event) {
	mouseDown = true;

	curTool.handleEvent(event);

	mainGrid.render();
}, false);

// handle mouse button being released
canvas.addEventListener("mouseup", function(event) {
	mouseDown = false;

	curTool.handleEvent(event);

	mainGrid.render();
}, false);

// handle key clicks
window.addEventListener("keydown", function(event) {
	if(event.which === 32) {
		if(curTool === Tools.PEN) {
			console.log("Tool: Eraser");
		   	curTool = Tools.ERASER;
		} else if(curTool === Tools.ERASER) {
			console.log("Tool: Pen");
		   	curTool = Tools.PEN;
		}
	}
}, false);

