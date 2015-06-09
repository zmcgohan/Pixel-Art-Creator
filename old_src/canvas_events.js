// screen (grid) resized
window.addEventListener("resize", function(event) {
	updatePositionsAndSizes();
	canvas.width = window.innerWidth * AR;
	canvas.height = window.innerHeight * AR;
	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';
	mainGrid.recalculateNumCells();
	updateScreen();
}, false);

// moving around the grid and zooming in/out
window.addEventListener("mousewheel", function(event) {
	event.preventDefault();
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

	updateScreen();
}, false);

// handle mouse button being depressed
canvas.addEventListener("mousedown", function(event) {
	mouseDown = true;

	console.log('Mouse is down');
	curTool.handleEvent(event);

	updateScreen();
}, false);

canvas.addEventListener("touchend", function(event) {
	console.log(event);
	event.preventDefault();

	curTool.handleEvent(event);

	updateScreen();
}, false);

// handle mouse button being released
canvas.addEventListener("mouseup", function(event) {
	mouseDown = false;

	curTool.handleEvent(event);

	updateScreen();
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
