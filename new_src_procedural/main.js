var AR = 2,
	screenWidthToHeightRatio = window.innerWidth / window.innerHeight;

var GRID_BG_COLORS = [ '#fafafa', '#dadada' ];

function PixelGrid() {
	this.canvas = document.getElementById('mainCanvas');
	this.ctx = this.canvas.getContext('2d');
	this.updateCanvasDimensions();

	this.numCols = Math.floor(10 + (window.innerWidth - 300) / 100);
	this.numRows = this.numCols / screenWidthToHeightRatio;
	this.cellWidth = window.innerWidth / this.numCols * AR;
	this.cellHeight = window.innerHeight / this.numRows * AR;

	this.sprites = [];
	this.curSpriteIndex = null;
}

/* Adjust all canvases on page to correct width/height. */
PixelGrid.prototype.updateCanvasDimensions = function() {
	this.canvas.style.width = window.innerWidth + 'px';
	this.canvas.style.height = window.innerHeight + 'px';
	this.canvas.width = window.innerWidth * AR;
	this.canvas.height = window.innerHeight * AR;
}

/* Render the Grid. */
PixelGrid.prototype.render = function() {
	// draw cells
	var i, j;
	for(i = 0; i < this.numCols; ++i) {
		for(j = 0; j < this.numRows; ++j) {
			this.ctx.fillStyle = GRID_BG_COLORS[(i + j) % 2];
			this.ctx.fillRect(i * this.cellWidth, j * this.cellHeight, this.cellWidth, this.cellHeight);
		}
	}
}

var pixelGrid = new PixelGrid();
pixelGrid.render();
