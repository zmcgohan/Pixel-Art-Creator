'use strict';

var AR = 2; // aspect ratio

var canvas, ctx, mainGrid;

var windows = [];

var curTool = Tools.PEN,
	curColor = '#FF0000';

var mouseDown = false;

/* EXECUTION SECTION */

setUp();
mainGrid = new Grid();

updateScreen();

/* EVENT HANDLERS */


// highlight moused-over cell
canvas.addEventListener("mousemove", function(event) {
	mainGrid.activeCell = mainGrid.getCellAtPos(mainGrid.topLeftViewPos.x+event.x*AR, mainGrid.topLeftViewPos.y+event.y*AR);

	curTool.handleEvent(event);

	updateScreen();
}, false);

// handle mouse button being depressed
canvas.addEventListener("mousedown", function(event) {
	mouseDown = true;

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
