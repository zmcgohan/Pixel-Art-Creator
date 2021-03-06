var CURRENT_SPRITE = 0,
	WHOLE_PROJECT = 1,
	GIF = 0,
	PNG = 1;

function ExportWindow() {
	this.exportCurSpriteButton = document.getElementById('exportCurSpriteButton');
	this.exportWholeProjectButton = document.getElementById('exportWholeProjectButton');
	this.exportGifButton = document.getElementById('exportGifButton');
	this.exportPngButton = document.getElementById('exportPngButton');
	this.exportButton = document.getElementById('exportButton');

	// test for download support on <a> tags
	var testA = document.createElement('a');
	if(typeof testA.download != 'undefined') {
		this.downloadSupport = true;
	} else {
		this.downloadSupport = false;
	}

	this.exportScope = CURRENT_SPRITE;
	this.exportFileType = GIF;

	this.addEventListeners();
}

ExportWindow.prototype.addEventListeners = function() {
	// "current sprite" button clicked
	this.exportCurSpriteButton.onclick = (function(event) {
		this.exportScope = CURRENT_SPRITE;
		this.exportWholeProjectButton.className = 'exportOptionButton';
		this.exportCurSpriteButton.className = 'exportOptionButton exportActiveButton';
	}).bind(this);
	// "whole project" button clicked
	this.exportWholeProjectButton.onclick = (function(event) {
		this.exportScope = WHOLE_PROJECT;
		this.exportWholeProjectButton.className = 'exportOptionButton exportActiveButton';
		this.exportCurSpriteButton.className = 'exportOptionButton';
	}).bind(this);

	// "Animated GIF" button clicked
	this.exportGifButton.onclick = (function(event) {
		var frameI;
		// change export buttons
		this.exportFileType = GIF;
		this.exportGifButton.className = 'exportOptionButton exportActiveButton';
		this.exportPngButton.className = 'exportOptionButton';

		// create link for download
		var conversionCanvases = [], // use canvas for each frame
			ctx,
			canvasBG = '#ffffff';
			gif = new GIF({ workers: 2, quality: 1, transparent: canvasBG});
		for(frameI = 0; frameI < grid.curSprite.sprite.frames.length; ++frameI) {
			conversionCanvases.push(document.createElement('canvas'));
			conversionCanvases[frameI].style.background = canvasBG;
			conversionCanvases[frameI].width = grid.curSprite.sprite.width;
			conversionCanvases[frameI].height = grid.curSprite.sprite.height;
			ctx = conversionCanvases[frameI].getContext('2d');
			grid.curSprite.sprite.render(ctx, frameI, 0, 0, 1);
			// add to GIF
			gif.addFrame(conversionCanvases[frameI], { delay: 250 });
		}
		gif.on('finished', (function(blob) {
			var urlCreator = window.URL || window.webkitURL;
			if(this.downloadSupport) { // supports <a> 'download' attribute
				this.exportButton.href = urlCreator.createObjectURL(blob);
				this.exportButton.download = 'sprite.gif';
			} else {
				blob.type = 'application/octet-stream';
				this.exportButton.href = urlCreator.createObjectURL(blob);
			}
		}).bind(this));
		gif.render();
	}).bind(this);
	// "PNG Sprite Sheet" button clicked
	this.exportPngButton.onclick = (function(event) {
		var frameI;
		// change export buttons
		this.exportFileType = PNG;
		this.exportGifButton.className = 'exportOptionButton';
		this.exportPngButton.className = 'exportOptionButton exportActiveButton';

		// create link in export button to PNG
		var conversionCanvas = document.createElement('canvas'),
			ctx = conversionCanvas.getContext('2d');
		conversionCanvas.width = grid.curSprite.sprite.width * grid.curSprite.sprite.frames.length;
		conversionCanvas.height = grid.curSprite.sprite.height;
		for(frameI = 0; frameI < grid.curSprite.sprite.frames.length; ++frameI) {
			grid.curSprite.sprite.render(ctx, frameI, frameI * grid.curSprite.sprite.width, 0, 1);
		}
		var img = conversionCanvas.toDataURL('image/png');
		if(this.downloadSupport) { // supports <a> 'download' attribute
			this.exportButton.href = img;
			this.exportButton.download = 'sprite.png';
		} else {
			this.exportButton.href = img.replace('image/png', 'application/octet-stream');
		}
	}).bind(this);

	// "Export" button clicked
	this.exportButton.onclick = (function(event) {
	}).bind(this);
}
