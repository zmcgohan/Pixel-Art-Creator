function getTestSprite() {
	var sprite = new Sprite();
	return sprite;
}

var SpriteTests = { };

SpriteTests.testGetTestSprite = function() {
	var sprite = getTestSprite();
	//console.log(sprite);
}

for(var test in SpriteTests) {
	SpriteTests[test]();
}
