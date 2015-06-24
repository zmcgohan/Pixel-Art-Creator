var CURRENT_TOOL_DIV_ID = 'currentTool',
	TOOLBOX_DIV_ID = 'toolBox';

// displays all of the available tools to be used
function ToolBox() {
	Window.call(this);

	this.curTool = tools.pen;
	this.currentToolDiv = document.getElementById(CURRENT_TOOL_DIV_ID);
	this.toolBoxDiv = document.getElementById(TOOLBOX_DIV_ID);

	// register events
	this.addCurrentToolEventListeners();
	this.toolBoxEventListenersAdded = false;
	//this.addToolBoxEventListeners();
	// initial visual update
	this.update();
}
ToolBox.prototype = Object.create(Window.prototype);

// adds event listeners to current tool div
ToolBox.prototype.addCurrentToolEventListeners = function() {
	var closeToolBox = function(event) {
		this.currentToolDiv.id = 'currentTool';
		this.toolBoxDiv.style.display = 'none';
		if(this.handleClickOutsideToolBox) {
			window.removeEventListener('mousedown', this.handleClickOutsideToolBox);
		}
	}
	closeToolBox = closeToolBox.bind(this);

	var currentToolClicked = (function(event) {
		console.log("Test");
		if(this.toolBoxDiv.style.display !== 'block') {
			this.currentToolDiv.id = 'currentToolActive';
			this.toolBoxDiv.style.display = 'block';
			// TODO (probably) add and remove toolBox event listeners as needed
			if(!this.toolBoxEventListenersAdded) {
				this.addToolBoxEventListeners();
				this.toolBoxEventListenersAdded = true;
			}
			event.stopPropagation();
			// if clicked outside of window, close tool box -- using 'this' so that it can be removed when not needed
			this.handleClickOutsideToolBox = function(event) {
				if(event.target.id !== 'toolBox' && event.target.className.indexOf('toolBoxIcon') === -1 && event.target.id !== 'currentToolActive') {
					closeToolBox(event);
				}
			}
			this.handleClickOutsideToolBox = this.handleClickOutsideToolBox.bind(this);
			window.addEventListener('mousedown', this.handleClickOutsideToolBox, false);
		} else {
			closeToolBox();
		}
	}).bind(this);
	this.currentToolDiv.addEventListener('mouseup', currentToolClicked, false);
}

// adds event listeners to tool box div
ToolBox.prototype.addToolBoxEventListeners = function() {
	var getToolIconClickHandler = (function(tool) {
		return (function(event) {
			if(this.curTool !== tool) {
				this.curTool = tool;
				this.update();
			}
		}).bind(this);
	}).bind(this);
	for(var toolName in tools) {
		var curIcon = document.getElementById(tools[toolName].iconId);
		// add click handlers to each tool icon
		curIcon.addEventListener('mouseup', getToolIconClickHandler(tools[toolName]), false);
	}
}

ToolBox.prototype.update = function() {
	// set current tool div's icon
	if(this.curTool === tools.pen) {
		this.currentToolDiv.style.backgroundImage = 'url(icons/pen.png)';
	} else if(this.curTool === tools.eraser) {
		this.currentToolDiv.style.backgroundImage = 'url(icons/eraser.png)';
	}
	// set correct classes on all tools' icons
	for(var toolName in tools) {
		document.getElementById(tools[toolName].iconId).className = 'toolBoxIcon';
	}
	document.getElementById(this.curTool.iconId).className += ' curToolIcon';
}
