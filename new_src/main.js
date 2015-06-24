// create main Grid
grid = new Grid();

// initialize all top-level Windows
/*
colorPaletteWindow = new ColorPaletteWindow();
colorPickerWindow = new ColorPickerWindow();
toolBoxWindow = new ToolBoxWindow();
animationWindow = new AnimationWindow();
layersWindow = new LayersWindow();
optionsWindow = new OptionsWindow();
*/

penTool = new PenTool();
eraserTool = new EraserTool();
penTool.addEventListeners();

grid.render();
