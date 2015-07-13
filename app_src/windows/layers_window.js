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

LayersWindow.prototype.getLayerContainerPos = function(layerContainer) {
	var layerI = 0;
	while(this.layerContainers[layerI] !== layerContainer) ++layerI;
	return layerI;
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

	// add a layer
	this.addLayerButton.addEventListener('mouseup', (function(event) {
		grid.curSprite.sprite.addLayer();
		this.fullUpdate();
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
	// set current layer visually
	var curFrame = grid.curSprite.sprite.frames[grid.curSprite.sprite.curFrameI];
	for(i = 0; i < this.layerContainers.length; ++i) {
		if(i !== grid.curSprite.sprite.curLayerI) this.layerContainers[i].removeAttribute('id');
		else this.layerContainers[i].id = 'activeLayerContainer';
		// TODO [2] should not be a constant -- have to implement a more fool-proof way (no internet right now doe)
		this.layerContainers[i].getElementsByTagName('img')[2].className = curFrame.layers[i].visible ? 'layerViewEyeShown' : 'layerViewEyeHidden';
		this.layerContainers[i].getElementsByClassName('layerTitle')[0].innerHTML = curFrame.layers[i].title;
	}
	// clear canvases
	for(i = 0; i < numLayers; ++i) {
		var ctx = this.layerContainers[i].getElementsByTagName('canvas')[0].getContext('2d');
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}
	if(grid.curSprite.sprite.width === 0) return; // no need to draw layers if sprite is empty
	// draw each layer of current frame
	for(i = 0; i < numLayers; ++i) {
		var maxDimension = curFrame.layers[i].pixels[0].length > curFrame.layers[i].pixels.length ? curFrame.layers[i].pixels[0].length : curFrame.layers[i].pixels.length,
			ctx = this.layerContainers[i].getElementsByTagName('canvas')[0].getContext('2d'),
			canvasWidth = ctx.canvas.width,
			pixelWidth, framePadding, usableWidth, 
			drawOffsetX, drawOffsetY;
		if(maxDimension <= MAX_LAYER_DISPLAY_PADDING_SIZE) framePadding = MAX_LAYER_DISPLAY_PADDING;
		else if(maxDimension >= MIN_LAYER_DISPLAY_PADDING_SIZE) framePadding = MIN_LAYER_DISPLAY_PADDING;
		else framePadding = MAX_LAYER_DISPLAY_PADDING - (MAX_LAYER_DISPLAY_PADDING - MIN_LAYER_DISPLAY_PADDING) * ((MAX_LAYER_DISPLAY_PADDING_SIZE + maxDimension) / MIN_LAYER_DISPLAY_PADDING_SIZE);
		usableWidth = canvasWidth - canvasWidth * framePadding;
		pixelWidth = usableWidth / maxDimension;
		if(curFrame.layers[i].pixels[0].length > curFrame.layers[i].pixels.length) { // width > height
			drawOffsetX = (framePadding / 2) * canvasWidth;
			drawOffsetY = canvasWidth / 2 - curFrame.layers[i].pixels.length / 2 * pixelWidth;
		} else {
			drawOffsetY = (framePadding / 2) * canvasWidth;
			drawOffsetX = canvasWidth / 2 - curFrame.layers[i].pixels[0].length / 2 * pixelWidth;
		}
		for(rows = 0; rows < curFrame.layers[i].pixels.length; ++rows) {
			for(cols = 0; cols < curFrame.layers[i].pixels[0].length; ++cols) {
				var curPxColor = curFrame.layers[i].pixels[rows][cols];
				if(curPxColor !== '') {
					ctx.fillStyle = curPxColor;
					ctx.fillRect(drawOffsetX + cols*pixelWidth, drawOffsetY + rows*pixelWidth, pixelWidth, pixelWidth);
				}
			}
		}
	}
}

LayersWindow.prototype.handleContainerClick = function(event) {
	// TODO getting parent container is (or will be) repeated. Should function it off (if that's even a phrase)
	var containerElem = event.target;
	while(containerElem.className !== 'layerContainer') containerElem = containerElem.parentNode;
	var layerI = this.getLayerContainerPos(containerElem);
	// TODO update curSprite's curLayerI
	// change visually active container
	this.layerContainers[grid.curSprite.sprite.curLayerI].removeAttribute('id');
	containerElem.id = 'activeLayerContainer';
	// change curLayerI
	grid.curSprite.sprite.curLayerI = layerI;
	grid.render();
}

LayersWindow.prototype.handleViewEyeClick = function(event) {
	var containerElem = event.target;
	while(containerElem.className !== 'layerContainer') containerElem = containerElem.parentNode;
	var layerI = this.getLayerContainerPos(containerElem);
	// TODO probably not in this class, but when eye isn't visible shouldn't be able to draw on that layer
	if(grid.curSprite.sprite.frames[0].layers[layerI].visible) {
		grid.curSprite.sprite.hideLayer(layerI);
		event.target.className = 'layerViewEyeHidden';
	} else {
		grid.curSprite.sprite.showLayer(layerI);
		event.target.className = 'layerViewEyeShown';
	}
	grid.render();
	animationWindow.update();
	event.stopPropagation(); // so it doesn't go to the layer-changing container click event .. might have to change
}

LayersWindow.prototype.handleUpArrowClick = function(event) {
	var containerElem = event.target;
	while(containerElem.className !== 'layerContainer') containerElem = containerElem.parentNode;
	var layerI = this.getLayerContainerPos(containerElem);
	if(layerI > 0) {
		grid.curSprite.sprite.switchLayers(layerI, layerI - 1);

		grid.render();
		animationWindow.update();
		spritesWindow.fullUpdate();
		layersWindow.fullUpdate();
	}
	event.stopPropagation(); // so it doesn't go to the layer-changing container click event .. might have to change
}

LayersWindow.prototype.handleDownArrowClick = function(event) {
	var containerElem = event.target;
	while(containerElem.className !== 'layerContainer') containerElem = containerElem.parentNode;
	var layerI = this.getLayerContainerPos(containerElem);
	if(layerI < this.layerContainers.length-1) {
		grid.curSprite.sprite.switchLayers(layerI, layerI + 1);

		grid.render();
		animationWindow.update();
		spritesWindow.fullUpdate();
		layersWindow.fullUpdate();
	}
	event.stopPropagation(); // so it doesn't go to the layer-changing container click event .. might have to change
}

// handles a double-click on title
LayersWindow.prototype.handleTitleEvent = function(event) {
	var containerElem = event.target;
	while(containerElem.className !== 'layerContainer') containerElem = containerElem.parentNode;
	var layerI = this.getLayerContainerPos(containerElem);
	var curLayer = grid.curSprite.sprite.frames[grid.curSprite.sprite.curFrameI].layers[layerI];
	function changeTitle() {
		// TODO accepts only whitespace right now
		if(event.target.innerHTML.trim().length === 0) event.target.innerHTML = curLayer.title;
		else {
			grid.curSprite.sprite.setLayerTitle(layerI, event.target.innerHTML.trim());
		}
	}
	if(event.type === 'dblclick') {
		// make title text editable
		event.target.contentEditable = true;
		// highlight current title
		var selection = window.getSelection(),
			range = document.createRange();
		range.selectNodeContents(event.target.childNodes[0]);
		selection.removeAllRanges();
		selection.addRange(range);
	} else if(event.type === 'keypress') {
		var keyCode = event.keyCode || event.which;
		var BACKSPACE = 8, TAB = 9, ENTER = 13;
		var isAlphaNumeric = /[a-zA-Z0-9-_ ]/.test(String.fromCharCode(keyCode));
		if(keyCode === ENTER || keyCode === TAB) {
			event.preventDefault();
			window.getSelection().removeAllRanges(); // clear highlighting
			event.target.blur(); // unfocus
			event.target.contentEditable = false;
			changeTitle();
		} else if(!isAlphaNumeric && keyCode !== BACKSPACE) {
			event.preventDefault();
		}
		//event.stopPropagation(); // keeps changing the current tool
	} else if(event.type === 'blur') {
		// TODO click fires before blur, so it always changes back to default
		event.target.contentEditable = false;
		changeTitle();
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
	newViewEye.className = 'layerViewEyeShown';
	// add container's children to it
	newContainer.appendChild(newLayerDisplay);
	newContainer.appendChild(newLayerTitle);
	newContainer.appendChild(newUpArrow);
	newContainer.appendChild(newDownArrow);
	newContainer.appendChild(newViewEye);
	// add click handler for container and its elements
	newContainer.addEventListener('mouseup', this.handleContainerClick.bind(this), false);
	newUpArrow.addEventListener('mouseup', this.handleUpArrowClick.bind(this), false);
	newDownArrow.addEventListener('mouseup', this.handleDownArrowClick.bind(this), false);
	newViewEye.addEventListener('mouseup', this.handleViewEyeClick.bind(this), false);
	newLayerTitle.addEventListener('dblclick', this.handleTitleEvent.bind(this), false);
	newLayerTitle.addEventListener('keypress', this.handleTitleEvent.bind(this), false);
	newLayerTitle.addEventListener('blur', this.handleTitleEvent.bind(this), false);
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
