var DEFAULT_BG_COLORS = [ '#fafafa', '#dedede' ],
	DEFAULT_LINE_COLOR = '#aaaaaa',
	DEFAULT_ACTIVE_CELL_COLOR = '#888888',
	DEFAULT_ACTIVE_CELL_ALPHA = 0.3,
	MIN_SCREEN_WIDTH = 300,
	SPRITE_DEFAULT_BG_COLOR = '#fdfdfd',
	MIN_CELL_WIDTH,
	MAX_CELL_WIDTH;

function Grid() {
	// TODO setting for min/max cell width -- pixel art can get very detailed
	MIN_CELL_WIDTH = Math.floor(canvas.width / 250); MAX_CELL_WIDTH = Math.floor(canvas.width / 3);
	this.sprites = [];
	this.curSprite = undefined; // current sprite being edited
	this.topLeftViewPos = { x: 0, y: 0 }; // top left view position (in pixels)
	this.lineColor = DEFAULT_LINE_COLOR; // color of cell separation lines
	this.bgColors = DEFAULT_BG_COLORS; // color of background cells
	this.numCols = Math.floor(10 + (canvas.width - MIN_SCREEN_WIDTH) / 50);
	this.numRows = Math.floor((canvas.height / canvas.width) * this.numCols);
	// TODO (possibly) make getters and setters for cellWidth/cellHeight -- Math.ceil() for values so no empty lines drawn on canvas?
	this.cellWidth = canvas.width / this.numCols;
	this.cellHeight = canvas.height / this.numRows;
	this.activeCell = { x: undefined, y: undefined };
	this.activeCellColor = DEFAULT_ACTIVE_CELL_COLOR;
	this.activeCellAlpha = DEFAULT_ACTIVE_CELL_ALPHA;

	// create initial sprite
	this.addSprite();
	this.curSprite = this.sprites[0];

	this.addEventListeners();
}

// adds a new sprite to grid
Grid.prototype.addSprite = function() {
	var newSprite = new Sprite();
	this.sprites.push({
		//pos: { x: undefined, y: undefined },
		pos: { x: undefined, y: undefined },
		sprite: newSprite
	});

}

// sets new cellWidth & cellHeight values based on a given new width
Grid.prototype.setCellWidth = function(newWidth) {
	var widthHeightRatio = this.cellWidth / this.cellHeight;

	this.cellWidth = newWidth;
	// cellWidth not in required bounds? make it in bounds
	if(this.cellWidth < MIN_CELL_WIDTH) this.cellWidth = MIN_CELL_WIDTH;
	else if(this.cellWidth > MAX_CELL_WIDTH) this.cellWidth = MAX_CELL_WIDTH;
	this.cellHeight = this.cellWidth / widthHeightRatio;

	// recalculate number of cells in grid
	this.recalculateNumCells();
}

// recalculates the number of grid columns/rows esp. after a grid size change
Grid.prototype.recalculateNumCells = function() {
	this.numCols = Math.ceil(canvas.width / this.cellWidth);
	this.numRows = Math.ceil(canvas.height / this.cellHeight);
}

Grid.prototype.getCellAtPos = function(x, y) {
	return { x: Math.floor(x / this.cellWidth),
			 y: Math.floor(y / this.cellHeight) };
}

Grid.prototype.render = function() {
	ctx.clearRect(0,0,canvas.width,canvas.height); // clear canvas
	var i, j,
		pxDiffX = this.topLeftViewPos.x % this.cellWidth,
		pxDiffY = this.topLeftViewPos.y % this.cellHeight,
		topLeftCellX = Math.floor(this.topLeftViewPos.x / this.cellWidth),
		topLeftCellY = Math.floor(this.topLeftViewPos.y / this.cellHeight);

	// DRAW VISIBLE CELLS
	for(i = 0; i < this.numRows+1; ++i) {
		for(j = 0; j < this.numCols+1; ++j) {
			var drawXPos, drawYPos; // cell top left draw coordinates
			// if x difference is negative, have to compensate
			if(pxDiffX >= 0) drawXPos = j*this.cellWidth-pxDiffX;
			else drawXPos = j*this.cellWidth-(this.cellWidth+pxDiffX);
			// same with y difference
			if(pxDiffY >= 0) drawYPos = i*this.cellHeight-pxDiffY;
			else drawYPos = i*this.cellHeight-(this.cellHeight+pxDiffY);
			// TODO: make the following sprite rendering more efficient.. because it's not. at all.
			// render current sprite
			var spriteCellColor = undefined;

			// pixel of a current sprite in cell? get its color
			for(var k = 0; k < this.sprites.length; ++k) {
				if(this.sprites[k].pos.x <= topLeftCellX+j && this.sprites[k].pos.x+this.sprites[k].sprite.width >= topLeftCellX && this.sprites[k].pos.y <= topLeftCellY+i && this.sprites[k].pos.y+this.sprites[k].sprite.height >= topLeftCellY) {
					var spritePxRow = (topLeftCellY+i)-this.sprites[k].pos.y,
						spritePxCol = (topLeftCellX+j)-this.sprites[k].pos.x;
					spriteCellColor = this.sprites[k].sprite.getPixel(spritePxRow, spritePxCol);
					if(spriteCellColor !== undefined)
						break;
				}
			}
			// floor pos and ceil width/height to avoid lines
			drawXPos = Math.floor(drawXPos);
			drawYPos = Math.floor(drawYPos);
			var drawCellWidth = Math.ceil(this.cellWidth),
				drawCellHeight = Math.ceil(this.cellHeight);
			if(spriteCellColor !== undefined) { // sprite cell found -- draw it
				if(spriteCellColor !== '') ctx.fillStyle = spriteCellColor;
				else ctx.fillStyle = SPRITE_DEFAULT_BG_COLOR;
				ctx.fillRect(drawXPos, drawYPos, drawCellWidth, drawCellHeight);
			} else { // empty cell -- default bg color
				// calculate background color -- different if in negative cells
				if(topLeftCellX+j >= 0 && topLeftCellY+i >= 0) ctx.fillStyle = this.bgColors[(topLeftCellX+topLeftCellY+i+j)%this.bgColors.length];
				else {
					var xAdd = topLeftCellX+j >= 0 ? topLeftCellX : this.bgColors.length + (topLeftCellX % this.bgColors.length);
					var yAdd = topLeftCellY+i >= 0 ? topLeftCellY : this.bgColors.length + (topLeftCellY % this.bgColors.length);
					ctx.fillStyle = this.bgColors[(xAdd+yAdd+i+j)%this.bgColors.length];
				}
				ctx.fillRect(drawXPos, drawYPos, drawCellWidth, drawCellHeight);
			}
			// if active cell, shade it
			if(topLeftCellX+j === this.activeCell.x && topLeftCellY+i === this.activeCell.y) {
				ctx.globalAlpha = this.activeCellAlpha;
				ctx.fillStyle = this.activeCellColor;
				ctx.fillRect(drawXPos, drawYPos, drawCellWidth, drawCellHeight);
				ctx.globalAlpha = 1.0;
			}
		}
	}

	/*
	// DRAW GRID LINES (TODO figure out whether this should even be here.. looks better without)
	ctx.strokeStyle = this.lineColor;
	ctx.lineWidth = 1;
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
	*/
}

Grid.prototype.addEventListeners = function() {
	// screen (grid) resized
	window.addEventListener("resize", function(event) {
		updatePositionsAndSizes();
		canvas.width = window.innerWidth * AR;
		canvas.height = window.innerHeight * AR;
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';
		grid.recalculateNumCells();
		grid.render();
		// TODO this might be better-placed in a general 'events' area (not Grid-specific)
		animationWindow.update();
		layersWindow.fullUpdate();
		spritesWindow.fullUpdate();
		colorPicker.fullUpdate();
	}, false);

	// moving around the grid and zooming in/out
	// TODO "jumpy" at MIN and MAX_CELL_WIDTH -- very low priority, but would like to smooth it out
	var SCROLL_MULTIPLIER = 1.8;
	canvas.addEventListener("wheel", function(event) {
		event.preventDefault();
		if(!event.ctrlKey) { // basic scrolling (moves grid)
			grid.topLeftViewPos.x += Math.floor(event.deltaX*SCROLL_MULTIPLIER);
			grid.topLeftViewPos.y += Math.floor(event.deltaY*SCROLL_MULTIPLIER);
			grid.render();
		} else { // Chrome sets ctrlKey flag for pinching -- zoom grid
			var widthHeightRatio = grid.cellHeight / grid.cellWidth,
				zoomAmount = event.deltaY,
				gridPosRatioX = grid.topLeftViewPos.x / grid.cellWidth,
				xCursorRatio = event.clientX*AR / grid.cellWidth,
				gridPosRatioY = grid.topLeftViewPos.y / grid.cellHeight,
				yCursorRatio = event.clientY*AR / grid.cellHeight;
			// prevent default behavior
			event.preventDefault();
			//event.stopImmediatePropagation();
			// scale grid's cell width and cell height
			grid.setCellWidth(grid.cellWidth - zoomAmount);
			// keep cursor at same pixel (if not at min or max -- then it just moves the grid)
			if(grid.cellWidth !== MIN_CELL_WIDTH && grid.cellWidth !== MAX_CELL_WIDTH) {
				grid.topLeftViewPos.x = gridPosRatioX * grid.cellWidth - xCursorRatio*zoomAmount;
				grid.topLeftViewPos.y = gridPosRatioY * grid.cellHeight - yCursorRatio*zoomAmount;
			}
			grid.render();
		}
	}, false);

	// highlight moused-over cell
	canvas.addEventListener("mousemove", function(event) {
		// TODO if activeCell stays the same, no reason to update (and later, when optimizing, can draw ONLY the cells that need updated)
		grid.activeCell = grid.getCellAtPos(grid.topLeftViewPos.x+event.clientX*AR, grid.topLeftViewPos.y+event.clientY*AR);

		toolBox.curTool.handleEvent(event);

		grid.render();
	}, false);

	// handle mouse button being depressed
	canvas.addEventListener("mousedown", function(event) {
		if(event.which !== 1) return; // not a left click -- don't bother
		mouseDown = true;

		toolBox.curTool.handleEvent(event);

		grid.render();
	}, false);

	canvas.addEventListener("touchend", function(event) {
		console.log(event);
		event.preventDefault();

		toolBox.curTool.handleEvent(event);

		grid.render();
	}, false);

	// handle mouse button being released
	canvas.addEventListener("mouseup", function(event) {
		mouseDown = false;

		toolBox.curTool.handleEvent(event);

		grid.render();
	}, false);
}
