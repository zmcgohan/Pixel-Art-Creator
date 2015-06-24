'use strict';

/* Global values */
var AR = 2; // aspect ratio

/* Top-level application objects */
var grid, // displayed Grid
	colorPaletteWindow, // current color palette and palette options
	colorPickerWindow, // color picker
	toolBoxWindow, // window for displaying/changing current tool
	animationWindow, // frame editing/current animation display
	layersWindow, // layer info/options window
	optionsWindow; // window for displaying/changing application options

/* Tools */
var penTool, // pen tool
	eraserTool; // eraser tool
