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
