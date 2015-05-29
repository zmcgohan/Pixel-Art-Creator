'use strict';

var AR = 2, // aspect ratio
	DEFAULT_BG_COLOR = '#fafafa',
	DEFAULT_LINE_COLOR = '#aaaaaa';

var canvas, ctx, mainGrid;

/* CLASS SECTION */

function Grid() {
	this.curSprite = null; // current sprite being edited
	this.bgSprites = null; // bg sprites (onion-skinning)
	this.topLeftViewPos = { x: 0, y: 0 }; // top left view position (in pixels)
	this.lineColor = DEFAULT_LINE_COLOR; // color of cell separation lines
	this.bgColors = [ DEFAULT_BG_COLOR, '#dadada' ]; // color of background cells
	this.numCols = Math.floor(10 + (canvas.width - 300) / 100);
	this.numRows = Math.floor((canvas.height / canvas.width) * this.numCols);
	this.cellWidth = canvas.width / this.numCols;
	this.cellHeight = canvas.height / this.numRows;
	this.activeCell = null;
	this.recalculateNumCells = function() {
		this.numCols = Math.ceil(canvas.width / this.cellWidth);
		this.numRows = Math.ceil(canvas.height / this.cellHeight);
	}
	this.render = function() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		var i, j,
			pxDiffX = this.topLeftViewPos.x % this.cellWidth,
			pxDiffY = this.topLeftViewPos.y % this.cellHeight,
			cellX = Math.floor((this.topLeftViewPos.x) / this.cellWidth),
			cellY = Math.floor((this.topLeftViewPos.y) / this.cellHeight);
		//console.log('Cell [' + cellY + ', ' + cellX + ']');
		// draw cells
		//console.log(pxDiffX + ' :.:.: ' + pxDiffY);
		for(i = 0; i < this.numRows+1; ++i) {
			for(j = 0; j < this.numCols+1; ++j) {
				var drawXPos, drawYPos;
				// if x difference is negative, have to compensate
				if(pxDiffX >= 0) drawXPos = j*this.cellWidth-pxDiffX;
				else drawXPos = j*this.cellWidth-(this.cellWidth+pxDiffX);
				// same with y difference
				if(pxDiffY >= 0) drawYPos = i*this.cellHeight-pxDiffY;
				else drawYPos = i*this.cellHeight-(this.cellHeight+pxDiffY);
				// calculate background color -- different if in negative cells
				if(cellX+j >= 0 && cellY+i >= 0) ctx.fillStyle = this.bgColors[(cellX+cellY+i+j)%this.bgColors.length];
				else {
					var xAdd = cellX+j >= 0 ? cellX : this.bgColors.length + (cellX % this.bgColors.length);
					var yAdd = cellY+i >= 0 ? cellY : this.bgColors.length + (cellY % this.bgColors.length);
					ctx.fillStyle = this.bgColors[(xAdd+yAdd+i+j)%this.bgColors.length];
				}
				ctx.fillRect(drawXPos, drawYPos, this.cellWidth, this.cellHeight);
			}
		}
		// draw grid lines
		ctx.strokeStyle = this.lineColor;
		for(i = 0; i <= this.numCols; ++i) {
			var xPos = Math.floor(this.cellWidth * i - pxDiffX);
			//console.log(xPos);
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

function Sprite() {
	this.width = 0;
	this.height = 0;
	this.frames = [];
}

function SpriteFrame() {
	this.pixels = [];
}

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

/* EVENT HANDLERS */

window.addEventListener("resize", function(event) {
	canvas.width = window.innerWidth * AR;
	canvas.height = window.innerHeight * AR;
	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';
	mainGrid.recalculateNumCells();
	mainGrid.render();
}, false);

// moving around the grid and zooming in/out
window.addEventListener("mousewheel", function(event) {
	if(!event.ctrlKey) { // basic scrolling (moves grid)
		mainGrid.topLeftViewPos.x -= event.wheelDeltaX;
		mainGrid.topLeftViewPos.y -= event.wheelDeltaY;
		mainGrid.render();
	} else { // Chrome sets ctrlKey flag for pinching -- zoom grid
		var MIN_CELL_WIDTH = 30 + Math.abs(canvas.width-300) / 150,
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
			//console.log('event.x = ' + event.x);
			//console.log('Ratio X: ' + gridPosRatioX + '\nRatio Y: ' + gridPosRatioY);
			//console.log('Cell width: ' + mainGrid.cellWidth); 
			mainGrid.topLeftViewPos.x = gridPosRatioX * mainGrid.cellWidth - xCursorRatio*zoomAmount;
			mainGrid.topLeftViewPos.y = gridPosRatioY * mainGrid.cellHeight - yCursorRatio*zoomAmount;
			//console.log('topLeftViewPos.x = ' + mainGrid.topLeftViewPos.x);
		}
		mainGrid.render();
	}
}, false);

// highlight moused-over cell
window.addEventListener("mousemove", function(event) {
	//console.log(event);
}, false);

/* EXECUTION SECTION */

setUp();
mainGrid = new Grid();
mainGrid.render();
