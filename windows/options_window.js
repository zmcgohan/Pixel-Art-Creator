// TODO I'm not sure if I like the look of the Options window -- might have to rework it a bit
// (BUT: it is much better, function AND look-wise, than a pull-out menu)

function OptionsWindow() {
	this.optionsMenuTitle = document.getElementById('optionsMenuTitle');
	this.optionsMenu = document.getElementById('optionsMenu');
	this.optionsIcon = document.getElementById('optionsIcon');

	this.categoryLabels = document.getElementsByClassName('sideBarCategory');
	this.categoryMenus = [ document.getElementById('exportMenu'), document.getElementById('projectsMenu'), document.getElementById('accountMenu') ];

	this.opened = false;

	this.addEventListeners();
	// set default category (whatever's first)
	this.changeCategory(0);
}

OptionsWindow.prototype.addEventListeners = function() {
	var i;

	// icon clicked -- open/close options menu
	this.optionsIcon.onclick = (function(event) {
		this.optionsMenu.style.display = 'block';
		this.optionsIcon.style.display = 'none';
		this.opened = true;
	}).bind(this);

	// menu's title clicked -- hide menu, show icon
	this.optionsMenuTitle.onclick = (function(event) {
		this.optionsMenu.style.display = 'none';
		this.optionsIcon.style.display = 'block';
		this.opened = false;
	}).bind(this);
	
	// click listener to all categories
	for(i = 0; i < this.categoryLabels.length; ++i) {
		this.categoryLabels[i].onmouseup = (function() {
			var categoryI = i;
			return (function(event) {
				this.changeCategory(categoryI);
			}).bind(this);
		}).bind(this)();
	}
}

OptionsWindow.prototype.changeCategory = function(newCategoryI) {
	var i;
	for(i = 0; i < this.categoryLabels.length; ++i) {
		this.categoryLabels[i].className = 'sideBarCategory';
		if(i !== newCategoryI) this.categoryMenus[i].style.display = 'none';
		else this.categoryMenus[i].style.display = 'block';
	}
	this.categoryLabels[newCategoryI].className += ' activeCategory';
}
