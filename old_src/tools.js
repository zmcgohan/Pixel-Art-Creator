// pen tool -- simply draws a pixel at the mouse position
function PenTool() {
	this.icon = 'icons/pen.png';
	this.iconId = 'penToolIcon';
	this.shortcutKeyCode = 'p'.charCodeAt(0);
}

PenTool.prototype.handleEvent = function(event) {
	if(event.type === 'mousedown' || (event.type === 'mousemove' && mouseDown) || event.type === 'touchend') {
		var clickedCell = undefined; 
		if(event.type !== 'touchend') {
			clickedCell = grid.getCellAtPos(grid.topLeftViewPos.x+event.clientX*AR, grid.topLeftViewPos.y+event.clientY*AR);
		} else {
			clickedCell = grid.getCellAtPos(grid.topLeftViewPos.x+event.changedTouches[0].pageX*AR, grid.topLeftViewPos.y+event.changedTouches[0].pageY*AR);
			console.log(clickedCell);
		}

		// no sprites currently -- create first one
		if(grid.sprites.length === 0) {
			grid.curSprite = { pos: clickedCell, sprite: new Sprite() };
			grid.sprites.push(grid.curSprite);
			grid.curSprite.sprite.colorPixel(0, 0, curColor);
		} else {
			// if successfully colored pixel of current sprite, move sprite if need be (so it stays in same position on canvas)
			var changedRow = clickedCell.y - grid.curSprite.pos.y,
				changedCol = clickedCell.x - grid.curSprite.pos.x;
			if(grid.curSprite.sprite.colorPixel(changedRow, changedCol, curColor)) {
				if(changedRow < 0) grid.curSprite.pos.y = clickedCell.y;
				if(changedCol < 0) grid.curSprite.pos.x = clickedCell.x;
			}
		}
	}
}

// eraser tool -- erases a pixel from sprite
function EraserTool() {
	this.icon = 'icons/eraser.png';
	this.iconId = 'eraserToolIcon';
	this.shortcutKeyCode = 'e'.charCodeAt(0);
}

EraserTool.prototype.handleEvent = function(event) {
	if(event.type === 'mousedown' || (event.type === 'mousemove' && mouseDown)) {
		if(grid.curSprite !== undefined) {
			var clickedCell = grid.getCellAtPos(grid.topLeftViewPos.x+event.clientX*AR, grid.topLeftViewPos.y+event.clientY*AR),
				changedRow = clickedCell.y - grid.curSprite.pos.y,
				changedCol = clickedCell.x - grid.curSprite.pos.x;
			var changedDimensions = grid.curSprite.sprite.erasePixel(changedRow, changedCol);
			if(grid.curSprite.sprite.width === 0 || grid.curSprite.sprite.height === 0) {
				grid.sprites.splice(grid.sprites.indexOf(grid.curSprite));
				grid.curSprite = undefined;
				dimensionsDisplay.update();
			} else {
				grid.curSprite.pos.x += changedDimensions.left;
				grid.curSprite.pos.y += changedDimensions.top;
			}
		}
	}
}

// TODO should be case-insensitive -- keyCode/which are weird.. figure it out
function addToolKeyHandlers() {
	window.addEventListener('keypress', function(event) {
		var keyPressed = event.which || event.keyCode || event.charCode;
		for(var toolName in tools) {
			if(keyPressed === tools[toolName].shortcutKeyCode && toolBox.curTool !== tools[toolName]) {
				toolBox.curTool = tools[toolName];
				toolBox.update();
				break;
			}
		}
	}, false);
}
