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
	projTitle.className = 'projectTitle';
	projTitle.innerHTML = 'Unnamed Project';
	projImagesContainer.className = 'projectImagesContainer';
	newProj.container.appendChild(projTitle);
	newProj.container.appendChild(projImagesContainer);
	newProj.projectImages[0].className = 'projectImageLarge';
	projImagesContainer.appendChild(newProj.projectImages[0]);
	if(this.projects.length > 0) this.projectsMenu.insertBefore(newProj.container, this.projects[0].container);
	else this.projectsMenu.appendChild(newProj.container);
	// change current project
	if(this.projects.length > 0) this.projects[0].container.className = 'projectContainer';
	newProj.container.className = 'projectContainer currentProjectContainer';
	// add new project to array
	this.projects.unshift(newProj);
}
