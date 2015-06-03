var Tools = {
	PEN: { // pen tool -- simply draws a pixel at the mouse position
		handleEvent: function(event) {
			if(event.type === 'mousedown' || (event.type === 'mousemove' && mouseDown)) {
				var clickedCell = mainGrid.getCellAtPos(mainGrid.topLeftViewPos.x+event.x*AR, mainGrid.topLeftViewPos.y+event.y*AR);

				if(mainGrid.curSprite === undefined) {
					mainGrid.curSprite = { pos: clickedCell, sprite: new Sprite() };
					mainGrid.curSprite.sprite.colorPixel(0, 0, curColor);
				} else {
					var changedRow = clickedCell.y - mainGrid.curSprite.pos.y,
						changedCol = clickedCell.x - mainGrid.curSprite.pos.x;
					if(changedRow < 0) mainGrid.curSprite.pos.y = clickedCell.y;
					if(changedCol < 0) mainGrid.curSprite.pos.x = clickedCell.x;
					mainGrid.curSprite.sprite.colorPixel(changedRow, changedCol, curColor);
				}
			}
		}
	},
	ERASER: { // eraser tool -- erases a pixel from sprite
		handleEvent: function(event) {
			if(event.type === 'mousedown' || (event.type === 'mousemove' && mouseDown)) {
				if(mainGrid.curSprite !== undefined) {
					var clickedCell = mainGrid.getCellAtPos(mainGrid.topLeftViewPos.x+event.x*AR, mainGrid.topLeftViewPos.y+event.y*AR),
						changedRow = clickedCell.y - mainGrid.curSprite.pos.y,
						changedCol = clickedCell.x - mainGrid.curSprite.pos.x;
					var changedDimensions = mainGrid.curSprite.sprite.erasePixel(changedRow, changedCol);
					if(mainGrid.curSprite.sprite.width === 0 || mainGrid.curSprite.sprite.height === 0) {
						mainGrid.curSprite = undefined;
					} else {
						mainGrid.curSprite.pos.x += changedDimensions.left;
						mainGrid.curSprite.pos.y += changedDimensions.top;
					}
				}
			}
		}
	}
};
