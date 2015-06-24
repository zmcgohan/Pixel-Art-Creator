function EraserTool() {
	Tool.call(this);
	this.mouseDown = false;
}

EraserTool.prototype = Object.create(Tool.prototype);
EraserTool.prototype.constructor = EraserTool;

EraserTool.prototype.initListeners = function() {
	this.eventListeners.mousedown = { 
		target: grid.canvas,
		func: function(event) {
			var clickedCell = grid.getCellAtPos(grid.topLeftViewPos.x+event.x*AR, grid.topLeftViewPos.y+event.y*AR);
			grid.clearCell(clickedCell.y, clickedCell.x);
			grid.render();
			this.mouseDown = true;
			event.preventDefault();
		}
	},
	this.eventListeners.mousemove = {
		target: grid.canvas,
		func: function(event) {
			if(this.mouseDown) {
				this.eventListeners.mousedown.func(event);
			}
			event.preventDefault();
		}
	},
	this.eventListeners.mouseup = {
		target: grid.canvas,
		func: function(event) {
			this.mouseDown = false;
			event.preventDefault();
		}
	}
}
