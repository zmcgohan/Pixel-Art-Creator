var MAX_CONTAINER_IMAGES = 16;

function ProjectsWindow() {
	this.projectsMenu = document.getElementById('projectsMenu');
	this.newProjectButton = document.getElementById('newProjectButton');
	this.saveProjectButton = document.getElementById('saveProjectButton');

	this.projects = []; // projects ordered by last date loaded (index 0 = current project)
	this.projectContainers = [];
	// add initial project
	this.addProject();

	this.addEventListeners();
}

ProjectsWindow.prototype.addEventListeners = function() {
	// new project button click
	this.newProjectButton.onclick = (function(event) {
		this.addProject();
	}).bind(this);
	// save project button click
	this.saveProjectButton.onclick = (function(event) {
		this.saveProjects();
	}).bind(this);
}

// completely updates all of the DOM elements from each project
ProjectsWindow.prototype.fullUpdate = function() {
	var i, j,
		unrepeatedSprites,
		curProject, curCtx, numToDraw;
	// make sure there's the correct number of project containers
	this.setNumProjectContainers(this.projects.length);

	for(i = 0; i < this.projects.length; ++i) {
		curProject = this.projects[i];
		// set current project container
		if(i === 0) this.projectContainers[i].container.className = 'projectContainer currentProjectContainer';
		else this.projectContainers[i].container.className = 'projectContainer';
		// make sure project container has right amount of sprites
		this.setNumProjectImages(i, curProject.sprites.length);
		// set title
		this.projectContainers[i].title.innerText = this.projects[i].name;
		unrepeatedSprites = getUnrepeatedSprites(this.projects[i].sprites);
		// draw each sprite onto image canvas
		if(unrepeatedSprites.length > 16) numToDraw = 16;
		else numToDraw = unrepeatedSprites.length;
		for(j = 0; j < numToDraw; ++j) {
			var curSprite,
				paddingX, paddingY, pixelWidth, usableWidth;
			curSprite = unrepeatedSprites[j];
			curCtx = this.projectContainers[i].images[j].getContext('2d');

			// set correct size of each canvas
			curCtx.canvas.width = curCtx.canvas.offsetWidth * AR;
			curCtx.canvas.height = curCtx.canvas.offsetHeight * AR;

			curCtx.clearRect(0, 0, curCtx.canvas.width, curCtx.canvas.height);
			// figure out padding
			var MAX_PADDING = 0.05;
			if(curSprite.width > curSprite.height) {
				paddingX = curCtx.canvas.width * MAX_PADDING;
				pixelWidth = (curCtx.canvas.width - paddingX*2) / curSprite.width;
				paddingY = curCtx.canvas.height / 2 - curSprite.height * pixelWidth / 2;
			} else {
				paddingY = curCtx.canvas.height * MAX_PADDING;
				pixelWidth = (curCtx.canvas.height - paddingY*2) / curSprite.height;
				paddingX = curCtx.canvas.width / 2 - curSprite.width * pixelWidth / 2;
			}
			curProject.sprites[j].sprite.render(curCtx, 0, paddingX, paddingY, pixelWidth);
		}
	}
}

// handles a single click on a project container -- changes current project
ProjectsWindow.prototype.handleContainerClick = function(container) {
	var projI = 0;
	while(this.projectContainers[projI].container !== container) ++projI;
	this.setCurrentProject(projI);
	this.fullUpdate();
}

// deals with all of the project name changing stuff (including input events, etc.)
ProjectsWindow.prototype.changeCurProjectName = function() {
	var projTitle = this.projectContainers[0].title,
		oldName = projTitle.innerHTML;
	var changeName = (function() {
		if(projTitle.innerText.length === 0)
			projTitle.innerText = oldName;
		else {
			this.projects[0].name = projTitle.innerText;
		}
	}).bind(this);
	if(!projTitle.onfocus) {
		projTitle.onfocus = (function(event) {
			setTimeout(function() {
				var selection = window.getSelection(),
				range = document.createRange();
				range.selectNodeContents(projTitle.childNodes[0]);
				selection.removeAllRanges();
				selection.addRange(range);
			}, 1);
		}).bind(this);
		projTitle.onblur = (function(event) {
			var selection = window.getSelection();
			selection.removeAllRanges();
			projTitle.removeAttribute('contentEditable');
			changeName();
		}).bind(this);
		projTitle.onkeydown = (function(event) {
			var keyCode = event.keyCode || event.which;
			if(keyCode === 13 || keyCode === 9) { // TAB or ENTER
				document.activeElement.blur();
				changeName();
				// TODO still goes up to change tool
			} else if(!((keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90) || keyCode === 8 || keyCode === 32 || keyCode === 37 || keyCode === 39)) {
				event.preventDefault();
			}
		}).bind(this);
	}
	projTitle.contentEditable = 'true';
	projTitle.focus();
}

// changes current project and moves the project container to the front of the containers
ProjectsWindow.prototype.setCurrentProject = function(curProjI) {
	var temp = this.projects[curProjI];
	this.projects.splice(curProjI, 1);
	this.projects.unshift(temp);
	curProject = this.projects[0];
	grid.sprites = curProject.sprites;
	grid.curSprite = grid.sprites[0];
	grid.render();
	animationWindow.update();
	layersWindow.fullUpdate();
	spritesWindow.fullUpdate();
	dimensionsDisplay.update();
	this.fullUpdate();
}

// TODO have to change grid's sprites
ProjectsWindow.prototype.addProject = function() {
	var newProj = new Project();
	this.projects.unshift(newProj);
	this.setCurrentProject(0);
}

// sets the number of projects (DOM & array)
ProjectsWindow.prototype.setNumProjectContainers = function(numProjects) {
	var newContainer = {
		container: undefined,
		title: undefined,
		changeTitleButton: undefined,
		imageContainer: undefined,
		images: []
	};
	// remove if necessary
	while(this.projectContainers.length > numProjects) {
		this.projectsMenu.removeChild(this.projectContainers[this.projectContainers.length-1]);
		this.projectContainers.splice(this.projectContainers.length-1, 1);
	}
	// add containers
	while(this.projectContainers.length < numProjects) {
		// create elements
		newContainer.container = document.createElement('div');
		newContainer.title = document.createElement('span');
		newContainer.changeTitleButton = document.createElement('span');
		newContainer.imageContainer = document.createElement('span');
		// set elements' classes/ids
		newContainer.container.className = 'projectContainer';
		newContainer.title.className = 'projectTitle';
		newContainer.changeTitleButton.className = 'changeProjectTitleButton';
		newContainer.imageContainer.className = 'projectImagesContainer';
		// append to container
		newContainer.container.appendChild(newContainer.title);
		newContainer.container.appendChild(newContainer.changeTitleButton);
		newContainer.container.appendChild(newContainer.imageContainer);
		this.projectsMenu.appendChild(newContainer.container);
		// add events
		newContainer.container.onmouseup = (function(event) {
			var container = getParentWithId(event.target, 'projectContainer');
			this.handleContainerClick(container);
		}).bind(this);
		newContainer.changeTitleButton.onmouseup = (function(event) {
			var container = getParentWithId(event.target, 'projectContainer');
			if(container === this.projectContainers[0].container)
				this.changeCurProjectName();
		}).bind(this);
		// add new container to list of project containers
		this.projectContainers.push(newContainer);
	}
}

// sets the number of images inside of project with index projI's container
ProjectsWindow.prototype.setNumProjectImages = function(projI, numImages) {
	if(numImages > MAX_CONTAINER_IMAGES) numImages = MAX_CONTAINER_IMAGES;
	var images = this.projectContainers[projI].images,
		imageClass = numImages > 4 ? 'projectImageSmall' : 'projectImageLarge',
		newImage,
		i;
	// reduce if necessary
	if(images.length > numImages) {
		this.projectContainers[projI].imageContainer.removeChild(images[images.length-1]);
		images.splice(images.length-1-(images.length-numImages), images.length-numImages);
	}
	// add what's necessary
	while(images.length < numImages) {
		newImage = document.createElement('canvas');
		this.projectContainers[projI].imageContainer.appendChild(newImage);
		images.push(newImage);
	}
	// set class names
	for(i = 0; i < images.length; ++i) {
		images[i].className = imageClass;
	}
}

ProjectsWindow.prototype.saveProjects = function() {
	console.log('Emitting projects.');
	socket.emit('save projects', this.projects);
}
