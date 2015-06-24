var CUR_LABEL_COLOR = 'rgba(34,34,34,1.0)',
	INACTIVE_LABEL_COLOR = 'rgba(34,34,34,0.3)';
var animationLabel = document.getElementById('animationLabel'),
	layersLabel = document.getElementById('layersLabel'),
	spritesLabel = document.getElementById('spritesLabel'),
	optionsLabel = document.getElementById('optionsLabel');

var animationContainer = document.getElementById('animationContainer'),
	layersContainer = document.getElementById('layersContainer'),
	spritesContainer = document.getElementById('spritesContainer'),
	optionsContainer = document.getElementById('optionsContainer');

var currentLabel = animationLabel,
	currentMenuContainer = animationContainer;

/* Bottom container's label clicks */
animationLabel.addEventListener('touchend', function(event) {
	// change label colors
	currentLabel.style.color = INACTIVE_LABEL_COLOR;
	animationLabel.style.color = CUR_LABEL_COLOR;
	currentLabel = animationLabel;
	// change active menu
	currentMenuContainer.style.display = 'none';
	animationContainer.style.display = 'block';
	currentMenuContainer = animationContainer;
	event.preventDefault();
}, false);

layersLabel.addEventListener('touchend', function(event) {
	currentLabel.style.color = INACTIVE_LABEL_COLOR;
	layersLabel.style.color = CUR_LABEL_COLOR;
	currentLabel = layersLabel;

	currentMenuContainer.style.display = 'none';
	layersContainer.style.display = 'block';
	currentMenuContainer = layersContainer;
	event.preventDefault();
}, false);

spritesLabel.addEventListener('touchend', function(event) {
	currentLabel.style.color = INACTIVE_LABEL_COLOR;
	spritesLabel.style.color = CUR_LABEL_COLOR;
	currentLabel = spritesLabel;

	currentMenuContainer.style.display = 'none';
	spritesContainer.style.display = 'block';
	currentMenuContainer = spritesContainer;
	event.preventDefault();
}, false);

optionsLabel.addEventListener('touchend', function(event) {
	currentLabel.style.color = INACTIVE_LABEL_COLOR;
	optionsLabel.style.color = CUR_LABEL_COLOR;
	currentLabel = optionsLabel;

	currentMenuContainer.style.display = 'none';
	optionsContainer.style.display = 'block';
	currentMenuContainer = optionsContainer;
	event.preventDefault();
}, false);
