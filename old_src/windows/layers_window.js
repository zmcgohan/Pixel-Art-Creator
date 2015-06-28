var LAYERS_CONTAINER_ID = 'layersContainer',
	LAYERS_SCROLL_CONTAINER_ID = 'layersScrollContainer',
	LAYERS_CONTAINER_TITLE_ID = 'layersContainerTitle',
	LAYERS_MINIMIZED_DIV_ID = 'layersMinimized',
	ADD_LAYER_BUTTON_ID = 'addLayerButton',
	MAX_LAYER_DISPLAY_PADDING = .80, // 80% frame padding at <= MAX_LAYER_DISPLAY_PADDING_SIZE
	MAX_LAYER_DISPLAY_PADDING_SIZE = 1,
	MIN_LAYER_DISPLAY_PADDING = .14, // 10% frame padding at >= MIN_LAYER_DISPLAY_PADDING_SIZE
	MIN_LAYER_DISPLAY_PADDING_SIZE = 15;

function LayersWindow() {
	this.layersContainer = document.getElementById(LAYERS_CONTAINER_ID);
	this.layersScrollContainer = document.getElementById(LAYERS_SCROLL_CONTAINER_ID);
	this.layersContainerTitle = document.getElementById(LAYERS_CONTAINER_TITLE_ID);
	this.layersMinimizedDiv = document.getElementById(LAYERS_MINIMIZED_DIV_ID);
	this.addLayerButton = document.getElementById(ADD_LAYER_BUTTON_ID);

	this.layerContainers = [];

	this.addEventListeners();
}

LayersWindow.prototype.addEventListeners = function() {
	// open layers window from minimized 
	this.layersMinimizedDiv.addEventListener('mouseup', (function(event) {
		this.layersMinimizedDiv.style.display = 'none'; // hide minimized bar
		this.layersContainer.style.display = 'block'; // show layers container
	}).bind(this), false);

	// minimize layers container on title bar click
	this.layersContainerTitle.addEventListener('mouseup', (function(event) {
		this.layersContainer.style.display = 'none'; // hide layers container
		this.layersMinimizedDiv.style.display = 'block'; // show layers minimized div
	}).bind(this), false);
}

// completely updates layers window
LayersWindow.prototype.fullUpdate = function() {
	var i;
	// add layers if needed
	var numLayers = grid.curSprite.sprite.frames[0].layers.length;
	while(this.layerContainers.length < numLayers)
		this.addLayer();
	while(this.layerContainers.length > numLayers)
		this.removeLayer();
	// set current layer
	var curFrame = grid.curSprite.sprite.frames[grid.curSprite.sprite.curFrameI];
	this.layerContainers[curFrame.curLayerI].id = 'activeLayerContainer';
	// draw each layer of current frame
	for(i = 0; i < numLayers; ++i) {
		// TODO center the drawing
		var maxDimension = curFrame.layers[i].pixels[0].length > curFrame.layers[i].pixels.length ? curFrame.layers[i].pixels[0].length : curFrame.layers[i].pixels.length,
			ctx = this.layerContainers[i].getElementsByTagName('canvas')[0].getContext('2d'),
			canvasWidth = ctx.canvas.width,
			pixelWidth, framePadding, usableWidth, drawOffset;
		// clear canvas
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		if(maxDimension <= MAX_LAYER_DISPLAY_PADDING_SIZE) framePadding = MAX_LAYER_DISPLAY_PADDING;
		else if(maxDimension >= MIN_LAYER_DISPLAY_PADDING_SIZE) framePadding = MIN_LAYER_DISPLAY_PADDING;
		else framePadding = MAX_LAYER_DISPLAY_PADDING - (MAX_LAYER_DISPLAY_PADDING - MIN_LAYER_DISPLAY_PADDING) * ((MAX_LAYER_DISPLAY_PADDING_SIZE + maxDimension) / MIN_LAYER_DISPLAY_PADDING_SIZE);
		usableWidth = canvasWidth - canvasWidth * framePadding;
		drawOffset = framePadding / 2 * canvasWidth;
		pixelWidth = usableWidth / maxDimension;
		for(rows = 0; rows < curFrame.layers[i].pixels.length; ++rows) {
			for(cols = 0; cols < curFrame.layers[i].pixels[0].length; ++cols) {
				var curPxColor = curFrame.layers[i].pixels[rows][cols];
				if(curPxColor !== '') {
					ctx.fillStyle = curPxColor;
					ctx.fillRect(drawOffset + cols*pixelWidth, drawOffset + rows*pixelWidth, pixelWidth, pixelWidth);
				}
			}
		}
	}
}

// adds a layer container element to end of scroll container and list of layer containers
LayersWindow.prototype.addLayer = function() {
	// create new elements
	var newContainer = document.createElement("div"),
		newLayerDisplay = document.createElement('canvas'),
		newLayerTitle = document.createElement('span'),
		newUpArrow = document.createElement('img'),
		newDownArrow = document.createElement('img'),
		newViewEye = document.createElement('img');
	// set elements' classes
	newContainer.className = 'layerContainer';
	newLayerDisplay.className = 'layerDisplay';
	newLayerTitle.className = 'layerTitle';
	newUpArrow.className = 'layerUpArrow';
	newDownArrow.className = 'layerDownArrow';
	newViewEye.className = 'layerViewEye';
	// set layer title
	newLayerTitle.innerHTML = 'Layer ' + (this.layerContainers.length + 1);
	// add container's children to it
	newContainer.appendChild(newLayerDisplay);
	newContainer.appendChild(newLayerTitle);
	newContainer.appendChild(newUpArrow);
	newContainer.appendChild(newDownArrow);
	newContainer.appendChild(newViewEye);
	// add container to scroll container
	this.layersScrollContainer.insertBefore(newContainer, this.addLayerButton);
	// update display's dimensions (uses offsetWidth -- think that needs to be displayed first)
	newLayerDisplay.width = newLayerDisplay.offsetWidth * AR;
	newLayerDisplay.height = newLayerDisplay.offsetHeight * AR;
	// add to array of layer containers
	this.layerContainers.push(newContainer);
}

LayersWindow.prototype.removeLayer = function() {
	this.layersScrollContainer.removeChild(this.layerContainers[this.layerContainers.length-1]);
	this.layerContainers.splice(this.layerContainers.length-1, 1);
}
