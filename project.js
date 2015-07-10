function Project() {
	this.name = 'Unnamed Project';
	this.sprites = [];
	this.lastEdited = Date.now();
}

Project.prototype.addSprite = function() {
	var newSprite = new Sprite();
	this.sprites.push({
		pos: { x: undefined, y: undefined },
		sprite: newSprite
	});
}
