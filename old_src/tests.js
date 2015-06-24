function getRandomHexColor() {
	return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function addRandomSprites() {
	var spriteOneWidth = Math.floor(Math.random()*26+1),
		spriteOneHeight = Math.floor(Math.random()*16+1);
	var spriteOne = new Sprite();
	spriteOne.width = spriteOneWidth;
	spriteOne.height = spriteOneHeight;
	spriteOne.frames.push(new Frame());

	spriteOne.frames[0].layers.push(new Layer());
	for(var i = 0; i < spriteOne.height; ++i) {
		spriteOne.frames[0].layers[0].pixels.push([]);
		for(var j = 0; j < spriteOne.width; ++j) {
			var randColor = getRandomHexColor();
			spriteOne.frames[0].layers[0].pixels[i].push(randColor);
		}
	}
	mainGrid.curSprite = { pos: { x: Math.floor(Math.random()*5), y: Math.floor(Math.random()*5)}, sprite: spriteOne };

	mainGrid.render();
}

function addBlankSprite() {
	var sprite = new Sprite();
	sprite.frames.push(new Frame());
	sprite.frames[0].layers.push(new Layer());

	mainGrid.curSprite = { pos: { x: 5, y: 5 }, sprite: sprite };
	mainGrid.render();
}

function testChangePixel(row, col, color) {
	var sprite = mainGrid.curSprite.sprite;
	sprite.colorPixel(row, col, color);
	console.log(sprite.frames[0].layers[0].pixels);
	mainGrid.render();
}

function createTestWindows() {
	var colorPalette = new ColorPalette(),
		toolBox = new ToolBox(),
		dimensionsDisplay = new DimensionsDisplay();
	colorPalette.activateColorDialog();
	windows.push(colorPalette);
	windows.push(toolBox);
	windows.push(dimensionsDisplay);
	updateScreen();
}

//createTestWindows();
