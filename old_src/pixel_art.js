'use strict';

/* Yes, the code for this is -slightly- less than perfectly organized. Thx */

var AR = 2, // aspect ratio
	screenWidthHeightRatio = window.innerWidth / window.innerHeight; // ratio of screen width to height

var canvas, ctx;

var grid, colorPalette, toolBox, animationWindow, dimensionsDisplay, layersWindow, spritesWindow;

var tools = {};

var curColor = '#FF0000';

var mouseDown = false;

/* EXECUTION SECTION */

setUp();

// initialize tools
tools.pen = new PenTool();
tools.eraser = new EraserTool();
addToolKeyHandlers();

// initialize objects
grid = new Grid();
colorPalette = new ColorPalette();
toolBox = new ToolBox();
animationWindow = new AnimationWindow();
dimensionsDisplay = new DimensionsDisplay();
layersWindow = new LayersWindow();
spritesWindow = new SpritesWindow();

grid.render();
