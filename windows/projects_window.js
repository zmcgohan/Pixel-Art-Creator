function ProjectsWindow() {
	this.projectsMenu = document.getElementById('projectsMenu');
	this.newProjectButton = document.getElementById('newProjectButton');
	this.saveProjectButton = document.getElementById('saveProjectButton');

	this.projects = []; // projects ordered by last date loaded (index 0 = current project)
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
		console.log('Saving current project.');
		this.projects[0].project.sprites = grid.sprites;
		console.log(this.projects[0].project.sprites === grid.sprites);
	}).bind(this);
}

// completely updates all of the DOM elements from each project
ProjectsWindow.prototype.fullUpdate = function() {
	var i, j,
		unrepeatedSprites;
	for(i = 0; i < this.projects.length; ++i) {
		this.projects[i].container.firstChild.innerHTML = this.projects[i].project.name;
		unrepeatedSprites = getUnrepeatedSprites(this.projects[i].project.sprites);
		for(j = 0; j < this.projects[i].projectImages; ++j) {
			
		}
	}
}

ProjectsWindow.prototype.handleContainerClick = function(container) {
	var projI = 0;
	while(this.projects[projI].container !== container) ++projI;
	this.setCurrentProject(projI);
}

ProjectsWindow.prototype.setCurrentProject = function(curProjI) {
	curProject = this.projects[curProjI].project;
	grid.sprites = curProject.sprites;
	grid.curSprite = grid.sprites[0];
	grid.render();
	animationWindow.update();
	layersWindow.fullUpdate();
	spritesWindow.fullUpdate();
}

// TODO have to change grid's sprites
ProjectsWindow.prototype.addProject = function() {
	// create new project and its DOM elements
	var newProj = {
		project: new Project(),
		container: document.createElement('div'),
		projectImages: [ document.createElement('canvas') ]
	},
		projTitle = document.createElement('span'),
		projImagesContainer = document.createElement('span');
	// set up DOM elements
	projTitle.className = 'projectTitle';
	projTitle.innerHTML = 'Unnamed Project';
	projImagesContainer.className = 'projectImagesContainer';
	newProj.container.appendChild(projTitle);
	newProj.container.appendChild(projImagesContainer);
	newProj.projectImages[0].className = 'projectImageLarge';
	projImagesContainer.appendChild(newProj.projectImages[0]);
	if(this.projects.length > 0) this.projectsMenu.insertBefore(newProj.container, this.projects[0].container);
	else this.projectsMenu.appendChild(newProj.container);
	// add event listeners
	newProj.container.onmouseup = (function(event) {
		var container = getParentWithId(event.target, 'projectContainer');
		this.handleContainerClick(container);
	}).bind(this);
	// change current project
	if(this.projects.length > 0) this.projects[0].container.className = 'projectContainer';
	newProj.container.className = 'projectContainer currentProjectContainer';
	// add new project to array
	this.projects.unshift(newProj);
	// set current project to new
	this.setCurrentProject(0);
}
