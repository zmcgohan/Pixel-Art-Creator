var AR = 2;

var GRID_CANVAS_ID = 'mainCanvas',
	DEFAULT_BG_COLORS = [ '#fafafa', '#dedede' ],
	DEFAULT_LINE_COLOR = '#aaaaaa',
	DEFAULT_ACTIVE_CELL_COLOR = '#888888',
	DEFAULT_ACTIVE_CELL_ALPHA = 0.3,
	MIN_SCREEN_WIDTH = 300,
	SPRITE_DEFAULT_BG_COLOR = '#fdfdfd';

function Grid() {
	this.canvas = document.getElementById(GRID_CANVAS_ID);
	this.ctx = this.canvas.getContext('2d');
	this.resizeCanvas();
	this.numCols = Math.floor(10 + (this.canvas.width - MIN_SCREEN_WIDTH) / 100);
	this.numRows = Math.floor((this.canvas.height / this.canvas.width) * this.numCols);
	this.cellWidth = this.canvas.width / this.numCols;
	this.cellHeight = this.canvas.height / this.numRows;
	this.curSprite = undefined; // current sprite being edited
	this.bgSprites = undefined; // bg sprites (onion-skinning)
	this.topLeftViewPos = { x: 0, y: 0 }; // top left view position (in pixels)
	this.lineColor = DEFAULT_LINE_COLOR; // color of cell separation lines
	this.bgColors = DEFAULT_BG_COLORS; // color of background cells
	this.activeCell = { x: undefined, y: undefined };
	this.activeCellColor = DEFAULT_ACTIVE_CELL_COLOR;
	this.activeCellAlpha = DEFAULT_ACTIVE_CELL_ALPHA;
	this.addEventListeners();
}

// updates the main grid canvas to the correct window dimensions
Grid.prototype.resizeCanvas = function() {
	this.canvas.style.width = window.innerWidth + 'px';
	this.canvas.style.height = window.innerHeight + 'px';
	this.canvas.width = window.innerWidth * AR;
	this.canvas.height = window.innerHeight * AR;
	this.recalculateNumCells();
}

Grid.prototype.recalculateNumCells = function() {
	this.numCols = Math.ceil(this.canvas.width / this.cellWidth);
	this.numRows = Math.ceil(this.canvas.height / this.cellHeight);
}

Grid.prototype.getCellAtPos = function(x, y) {
	return { x: Math.floor(x / this.cellWidth),
			 y: Math.floor(y / this.cellHeight) };
}

Grid.prototype.colorCell = function(row, col) {
	if(this.curSprite === undefined) {
		this.curSprite = { pos: { x: col, y: row }, sprite: new Sprite() };
		this.curSprite.sprite.colorPixel(0, 0, '#ff0000');
	} else {
		var changedRow = row - this.curSprite.pos.y,
			changedCol = col - this.curSprite.pos.x;
		if(changedRow < 0) this.curSprite.pos.y = row;
		if(changedCol < 0) this.curSprite.pos.x = col;
		this.curSprite.sprite.colorPixel(changedRow, changedCol, '#ff0000');
	}
}

Grid.prototype.clearCell = function(row, col) {
	if(this.curSprite !== undefined) {
		var changedRow = row - this.curSprite.pos.y,
			changedCol = col - this.curSprite.pos.x;
		var changedDimensions = this.curSprite.sprite.erasePixel(changedRow, changedCol);
		if(this.curSprite.sprite.width === 0 || this.curSprite.sprite.height === 0) {
			this.curSprite = undefined;
		} else {
			this.curSprite.pos.x += changedDimensions.left;
			this.curSprite.pos.y += changedDimensions.top;
		}
	}
}

Grid.prototype.render = function() {
	var i, j,
		pxDiffX = this.topLeftViewPos.x % this.cellWidth,
		pxDiffY = this.topLeftViewPos.y % this.cellHeight,
		topLeftCellX = Math.floor((this.topLeftViewPos.x) / this.cellWidth),
		topLeftCellY = Math.floor((this.topLeftViewPos.y) / this.cellHeight);

	this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

	// DRAW VISIBLE CELLS
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
				if(spriteCellColor !== '') this.ctx.fillStyle = spriteCellColor;
				else this.ctx.fillStyle = SPRITE_DEFAULT_BG_COLOR;
				this.ctx.fillRect(drawXPos, drawYPos, this.cellWidth, this.cellHeight);
			} else { // empty cell -- default bg color
				// calculate background color -- different if in negative cells
				if(topLeftCellX+j >= 0 && topLeftCellY+i >= 0) this.ctx.fillStyle = this.bgColors[(topLeftCellX+topLeftCellY+i+j)%this.bgColors.length];
				else {
					var xAdd = topLeftCellX+j >= 0 ? topLeftCellX : this.bgColors.length + (topLeftCellX % this.bgColors.length);
					var yAdd = topLeftCellY+i >= 0 ? topLeftCellY : this.bgColors.length + (topLeftCellY % this.bgColors.length);
					this.ctx.fillStyle = this.bgColors[(xAdd+yAdd+i+j)%this.bgColors.length];
				}
				this.ctx.fillRect(drawXPos, drawYPos, this.cellWidth, this.cellHeight);
			}
			// if active cell, shade it
			if(topLeftCellX+j === this.activeCell.x && topLeftCellY+i === this.activeCell.y) {
				this.ctx.globalAlpha = this.activeCellAlpha;
				this.ctx.fillStyle = this.activeCellColor;
				this.ctx.fillRect(drawXPos, drawYPos, this.cellWidth, this.cellHeight);
				this.ctx.globalAlpha = 1.0;
			}
		}
	}

	// DRAW GRID LINES
	this.ctx.strokeStyle = this.lineColor;
	this.ctx.lineWidth = 1;
	for(i = 0; i <= this.numCols; ++i) {
		var xPos = Math.floor(this.cellWidth * i - pxDiffX);
		this.ctx.beginPath();
		this.ctx.moveTo(xPos, 0);
		this.ctx.lineTo(xPos, this.canvas.height);
		this.ctx.closePath();
		this.ctx.stroke();
	}
	for(i = 0; i <= this.numRows; ++i) {
		var yPos = Math.floor(this.cellHeight * i - pxDiffY);
		this.ctx.beginPath();
		this.ctx.moveTo(0, yPos);
		this.ctx.lineTo(this.canvas.width, yPos);
		this.ctx.closePath();
		this.ctx.stroke();
	}
}

// adds all of the event listeners for Grid
Grid.prototype.addEventListeners = function() {
	function handleResizeEvent() {
		this.resizeCanvas();
		this.render();
	}
	window.addEventListener("resize", handleResizeEvent.bind(this), false);

	var onPen = true;
	window.addEventListener("keydown", function() {
		if(onPen) {
			penTool.removeEventListeners();
			eraserTool.addEventListeners();
			onPen = false;
		} else {
			eraserTool.removeEventListeners();
			penTool.addEventListeners();
			onPen = true;
		}
	}, false);

	// moving around the grid and zooming in/out
	function handleMouseWheelEvent(event) {
		if(!event.ctrlKey) { // basic scrolling (moves grid)
			this.topLeftViewPos.x -= event.wheelDeltaX;
			this.topLeftViewPos.y -= event.wheelDeltaY;
			this.render();
		} else { // Chrome sets ctrlKey flag for pinching -- zoom grid
			var MIN_CELL_WIDTH = 30 + Math.abs(this.canvas.width-MIN_SCREEN_WIDTH) / 150,
				MAX_CELL_WIDTH = this.canvas.width / 3,
				widthHeightRatio = this.cellHeight / this.cellWidth,
				zoomAmount = event.deltaY,
				gridPosRatioX = this.topLeftViewPos.x / this.cellWidth,
				xCursorRatio = event.x*AR / this.cellWidth,
				gridPosRatioY = this.topLeftViewPos.y / this.cellHeight,
				yCursorRatio = event.y*AR / this.cellHeight;
			// prevent default behavior
			event.preventDefault();
			event.stopImmediatePropagation();
			// scale grid's cell width and cell height
			this.cellWidth -= zoomAmount;
			if(this.cellWidth < MIN_CELL_WIDTH) this.cellWidth = MIN_CELL_WIDTH;
			else if(this.cellWidth > MAX_CELL_WIDTH) this.cellWidth = MAX_CELL_WIDTH;
			this.cellHeight = this.cellWidth * widthHeightRatio;
			this.recalculateNumCells();
			// keep cursor at same pixel (if not at min or max -- then it just moves the grid)
			if(this.cellWidth !== MIN_CELL_WIDTH && this.cellWidth !== MAX_CELL_WIDTH) {
				this.topLeftViewPos.x = gridPosRatioX * this.cellWidth - xCursorRatio*zoomAmount;
				this.topLeftViewPos.y = gridPosRatioY * this.cellHeight - yCursorRatio*zoomAmount;
			}
			this.render();
		}
		event.preventDefault();
	}
	window.addEventListener("mousewheel", handleMouseWheelEvent.bind(this), false);

	// highlight moused-over cell
	function handleMouseMoveEvent(event) {
		this.activeCell = this.getCellAtPos(this.topLeftViewPos.x+event.x*AR, this.topLeftViewPos.y+event.y*AR);
		this.render();
	}
	this.canvas.addEventListener("mousemove", handleMouseMoveEvent.bind(this), false);
}

var grid = new Grid();
grid.render();
