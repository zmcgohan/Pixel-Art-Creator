var DEFAULT_BG_COLORS = [ '#fafafa', '#dedede' ],
	DEFAULT_LINE_COLOR = '#aaaaaa',
	DEFAULT_ACTIVE_CELL_COLOR = '#888888',
	DEFAULT_ACTIVE_CELL_ALPHA = 0.3,
	MIN_SCREEN_WIDTH = 300,
	SPRITE_DEFAULT_BG_COLOR = '#fdfdfd';

function Grid() {
	this.curSprite = undefined; // current sprite being edited
	this.bgSprites = undefined; // bg sprites (onion-skinning)
	this.topLeftViewPos = { x: 0, y: 0 }; // top left view position (in pixels)
	this.lineColor = DEFAULT_LINE_COLOR; // color of cell separation lines
	this.bgColors = DEFAULT_BG_COLORS; // color of background cells
	this.numCols = Math.floor(10 + (canvas.width - MIN_SCREEN_WIDTH) / 100);
	this.numRows = Math.floor((canvas.height / canvas.width) * this.numCols);
	this.cellWidth = canvas.width / this.numCols;
	this.cellHeight = canvas.height / this.numRows;
	this.activeCell = { x: undefined, y: undefined };
	this.activeCellColor = DEFAULT_ACTIVE_CELL_COLOR;
	this.activeCellAlpha = DEFAULT_ACTIVE_CELL_ALPHA;
}

Grid.prototype.recalculateNumCells = function() {
	this.numCols = Math.ceil(canvas.width / this.cellWidth);
	this.numRows = Math.ceil(canvas.height / this.cellHeight);
}

Grid.prototype.getCellAtPos = function(x, y) {
	return { x: Math.floor(x / this.cellWidth),
			 y: Math.floor(y / this.cellHeight) };
}

Grid.prototype.render = function() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	var i, j,
		pxDiffX = this.topLeftViewPos.x % this.cellWidth,
		pxDiffY = this.topLeftViewPos.y % this.cellHeight,
		topLeftCellX = Math.floor((this.topLeftViewPos.x) / this.cellWidth),
		topLeftCellY = Math.floor((this.topLeftViewPos.y) / this.cellHeight);

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
				if(spriteCellColor !== '') ctx.fillStyle = spriteCellColor;
				else ctx.fillStyle = SPRITE_DEFAULT_BG_COLOR;
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

	// DRAW GRID LINES
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

// GRID EVENT MANAGERS

// screen (grid) resized
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
