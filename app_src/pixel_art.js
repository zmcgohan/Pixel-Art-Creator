'use strict';

/* Yes, the code for this is -slightly- less than perfectly organized. Thx */

var AR = 2, // aspect ratio
	screenWidthHeightRatio = window.innerWidth / window.innerHeight; // ratio of screen width to height

var socket = io();

var canvas, ctx;

var curProject,
	grid, 
	colorPalette,
   	toolBox, 
	animationWindow, 
	dimensionsDisplay, 
	layersWindow, 
	spritesWindow,
	colorPicker,
	optionsWindow,
		exportWindow,
		projectsWindow,
		accountWindow;

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
colorPicker = new ColorPicker();
optionsWindow = new OptionsWindow(),
	exportWindow = new ExportWindow(),
	projectsWindow = new ProjectsWindow(),
	accountWindow = new AccountWindow();

// initial visual setup
grid.render();
animationWindow.update();
layersWindow.fullUpdate();
spritesWindow.fullUpdate();

// TODO make it so scrolls only work on specific elements (to prevent moving in history accidentally)
//document.getElementById('optionsContainer').style.left = '0';
