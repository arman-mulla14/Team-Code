// No Firebase configuration needed for Local Storage

// DOM Elements (Main.html specific)
const createProjectBtn = document.getElementById('createProjectBtn');
const startProjectBtn = document.getElementById('startProjectBtn');
const projectForm = document.getElementById('projectForm');
const createProject = document.getElementById('createProject');
const welcomeScreen = document.getElementById('welcomeScreen');
const joinProjectBtn = document.getElementById('joinProjectBtn');
const projectList = document.getElementById('projectList');
const importProjectBtn = document.getElementById('importProjectBtn');
const projectNameInput = document.getElementById('projectName');
const projectGridView = document.getElementById('projectGridView');
const projectCardsContainer = document.getElementById('projectCardsContainer');

// Initialize Bootstrap modals only if elements exist
const joinProjectModal = document.getElementById('joinProjectModal') ? new bootstrap.Modal(document.getElementById('joinProjectModal')) : null;
const createProjectModal = document.getElementById('createProjectModal') ? new bootstrap.Modal(document.getElementById('createProjectModal')) : null;
const importProjectModal = document.getElementById('importProjectModal') ? new bootstrap.Modal(document.getElementById('importProjectModal')) : null;

// Global project state
let projects = {}; // Initialize as an empty object

// Update API base URL to use HTTP
const API_BASE_URL = 'http://localhost:3000/api';

// Load projects and render initial view
loadProjectsFromLocalStorage();
renderProjectGrid(); // This will show welcomeScreen or projectGridView appropriately

// Event Listeners (Main.html specific)
if (createProjectBtn) {
    createProjectBtn.addEventListener('click', () => {
        console.log('Create Project Button Clicked');
        if (createProjectModal) createProjectModal.show();
    });
}

if (startProjectBtn) {
    startProjectBtn.addEventListener('click', () => {
        console.log('Start Project Button Clicked');
        if (createProjectModal) createProjectModal.show();
    });
}

if (joinProjectBtn) {
    joinProjectBtn.addEventListener('click', () => {
        console.log('Join Project Button Clicked');
        loadProjectList();
        if (joinProjectModal) joinProjectModal.show();
    });
}

if (importProjectBtn) {
    importProjectBtn.addEventListener('click', () => {
        if (importProjectModal) importProjectModal.show();
    });
}

if (createProject) {
    createProject.addEventListener('click', () => {
        console.log('Create Project (Modal) Button Clicked');
        const projectName = projectNameInput ? projectNameInput.value : '';
        const projectDescription = document.getElementById('projectDescription') ? document.getElementById('projectDescription').value : '';
        const passwordProtect = document.getElementById('projectPasswordProtect') ? document.getElementById('projectPasswordProtect').checked : false;

        if (!projectName) {
            showToast('Please enter a project name', 'warning');
            return;
        }

        if (passwordProtect) {
            showProjectPasswordDialog(projectName, projectDescription);
        } else {
            createNewProject(projectName, projectDescription);
        }
    });
}

// Local Storage Functions
function saveProjectsToLocalStorage() {
    localStorage.setItem('projectHosterProjects', JSON.stringify(projects));
}

function loadProjectsFromLocalStorage() {
    const storedProjects = localStorage.getItem('projectHosterProjects');
    if (storedProjects) {
        projects = JSON.parse(storedProjects);
    } else {
        projects = {}; // Initialize as an empty object
    }
    console.log('Projects loaded from Local Storage:', projects); // Debugging line
    console.log('Type of projects after loading:', typeof projects, 'Is Array:', Array.isArray(projects)); // New debugging line
}

function loadProjectList() {
    projectList.innerHTML = '';
    if (Object.keys(projects).length === 0) {
        projectList.innerHTML = '<li class="list-group-item">No projects found. Create a new one!</li>';
        return;
    }

    Object.values(projects).forEach(project => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.textContent = project.name;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
            joinProjectModal.hide();
            localStorage.setItem('currentProjectId', project.id); // Store projectId
            window.location.href = 'index.html'; // Redirect to editor page
        });
        projectList.appendChild(li);
    });
}

// Add context menu state variables
let contextMenuProjectId = null;

// Add context menu DOM elements
const projectContextMenu = document.getElementById('projectContextMenu');
const projectContextOpen = document.getElementById('projectContextOpen');
const projectContextDelete = document.getElementById('projectContextDelete');
const projectContextRename = document.getElementById('projectContextRename');
const projectContextDuplicate = document.getElementById('projectContextDuplicate');

// Context menu event listeners
projectContextMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('context-menu-item')) {
        projectContextMenu.style.display = 'none';
    }
});

projectContextOpen.addEventListener('click', () => {
    if (contextMenuProjectId) {
        const project = projects[contextMenuProjectId];
        if (project.isPasswordProtected) {
            showProjectAccessPrompt(project);
        } else {
            window.location.href = `index.html?projectId=${contextMenuProjectId}`;
        }
    }
});

projectContextDelete.addEventListener('click', () => {
    if (contextMenuProjectId) {
        if (confirm(`Are you sure you want to delete "${projects[contextMenuProjectId].name}"?`)) {
            deleteProject(contextMenuProjectId);
        }
    }
});

projectContextRename.addEventListener('click', () => {
    if (contextMenuProjectId) {
        const project = projects[contextMenuProjectId];
        const newName = prompt('Enter new project name:', project.name);
        if (newName && newName.trim() !== '') {
            project.name = newName.trim();
            saveProjectsToLocalStorage();
            renderProjectGrid();
            showToast(`Project renamed to "${newName}"`, 'success');
        }
    }
});

projectContextDuplicate.addEventListener('click', () => {
    if (contextMenuProjectId) {
        const project = projects[contextMenuProjectId];
        const newId = Date.now().toString();
        const newProject = {
            ...project,
            id: newId,
            name: `${project.name} (Copy)`,
            createdAt: new Date().toISOString()
        };
        projects[newId] = newProject;
        saveProjectsToLocalStorage();
        renderProjectGrid();
        showToast(`Project "${project.name}" duplicated successfully`, 'success');
    }
});

// Hide context menu when clicking anywhere else
document.addEventListener('click', () => {
    projectContextMenu.style.display = 'none';
});

// Function to render project grid
function renderProjectGrid() {
    projectCardsContainer.innerHTML = ''; // Clear existing cards

    console.log('Rendering project grid. Current projects:', projects); // Debugging line

    if (Object.keys(projects).length === 0) {
        console.log('No projects found. Showing welcome screen.');
        welcomeScreen.style.display = 'block'; // Show welcome if no projects
        projectGridView.style.display = 'none';
    } else {
        console.log('Projects found. Showing project grid view.');
        welcomeScreen.style.display = 'none'; // Hide welcome if projects exist
        projectGridView.style.display = 'block'; // Show project grid
    }

    Object.values(projects).forEach(project => {
        console.log('Rendering project card for:', project.name); // Debugging line
        const projectCard = document.createElement('div');
        projectCard.className = 'col';
        projectCard.innerHTML = `
            <div class="card h-100 bg-dark text-white border-secondary">
                <div class="card-body d-flex flex-column align-items-center justify-content-center">
                    <i class="mdi mdi-folder-multiple display-3 text-warning mb-3"></i> <!-- Project Folder Icon -->
                    <h5 class="card-title text-center">${project.name}</h5>
                    <p class="card-text text-muted text-center">${project.description || 'No description'}</p>
                    ${project.isPasswordProtected ? '<span class="badge bg-warning mb-2"><i class="mdi mdi-lock me-1"></i>Password Protected</span>' : ''}
                </div>
                <div class="card-footer d-flex justify-content-around">
                    <button class="btn btn-primary open-project-btn" data-id="${project.id}" style="display:none;"><i class="mdi mdi-folder-open"></i> Open</button>
                    <button class="btn btn-danger delete-project-btn" data-id="${project.id}" style="display:none;"><i class="mdi mdi-trash-can"></i> Delete</button>
                </div>
            </div>
        `;

        let pressTimer;
        let isLongPress = false;

        // Add click event listener to open project on short tap
        projectCard.addEventListener('click', (e) => {
            // Prevent accidental clicks if a long press just finished or if it's a synthetic click
            if (isLongPress || e.detail === 0) {
                isLongPress = false; // Reset for next interaction
                return;
            }
            console.log(`Project card clicked: ${project.name}`);
            if (project.isPasswordProtected) {
                showProjectAccessPrompt(project);
            } else {
                window.location.href = `index.html?projectId=${project.id}`;
            }
        });

        // Add context menu event listener to the card (for desktop right-click)
        projectCard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextMenuProjectId = project.id;
            showProjectContextMenu(e.clientX, e.clientY);
        });

        // Add touch event listeners for long press on mobile
        projectCard.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isLongPress = false; // Reset flag
                pressTimer = setTimeout(() => {
                    isLongPress = true;
                    showProjectContextMenu(e.touches[0].clientX, e.touches[0].clientY);
                }, 700); // 700ms for a long press
            }
        }, { passive: false });

        projectCard.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        projectCard.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });

        projectCardsContainer.appendChild(projectCard);
    });
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        delete projects[projectId];
        saveProjectsToLocalStorage();
        showToast('Project deleted successfully!', 'success');
        renderProjectGrid(); // Re-render the grid after deletion
    }
}

// Helper function for toasts (copied from previous app.js, needed in main.js)
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        console.warn('Toast container not found.', message);
        return;
    }

    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-white bg-${type} border-0 fade show`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toastElement);

    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Auto-hide after 5 seconds
    setTimeout(() => toast.hide(), 5000);
}

// Initial setup for the main.html page
document.addEventListener('DOMContentLoaded', () => {
    // Ensure the toast container is ready if needed before user interaction
    const toastContainerDiv = document.createElement('div');
    toastContainerDiv.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainerDiv.innerHTML = '<!-- Toasts will be appended here -->';
    document.body.appendChild(toastContainerDiv);

    // Initial rendering of the project grid or welcome screen
    renderProjectGrid();
});

// Import Project Functionality (added to main.js)
document.getElementById('confirmImport').addEventListener('click', async () => {
    const fileInput = document.getElementById('projectFolder');
    const files = fileInput.files;
    
    if (files.length === 0) {
        showToast('Please select a folder to import', 'warning');
        return;
    }

    try {
        // Get the root folder name
        const rootPath = files[0].webkitRelativePath.split('/')[0];
        const projectName = rootPath;
        
        // Create new project object with flat file/folder arrays
        const project = {
            id: Date.now().toString(),
            name: projectName,
            files: [], // Initialize as an array
            folders: [], // Initialize as an array
            lastModified: new Date().toISOString()
        };

        // Use a Set to keep track of created folder paths to avoid duplicates
        const createdFolders = new Set();

        // Process all files and create flat file and folder arrays
        for (const file of files) {
            const relativePath = file.webkitRelativePath.substring(rootPath.length + 1); // Get path relative to the root folder selected
            const pathParts = relativePath.split('/');
            const fileName = pathParts.pop(); // Last part is the file name
            const folderPath = pathParts.join('/'); // Remaining parts form the folder path

            // Add folders to the folders array
            let currentFolderPath = '';
            for (const part of pathParts) {
                if (currentFolderPath === '') {
                    currentFolderPath = part;
                } else {
                    currentFolderPath += `/${part}`;
                }
                if (!createdFolders.has(currentFolderPath)) {
                    project.folders.push({
                        name: part, // Name of the current folder part
                        path: currentFolderPath,
                        type: 'folder'
                    });
                    createdFolders.add(currentFolderPath);
                }
            }

            // Read file content
            const content = await readFileContent(file);
            
            // Add file to the files array
            project.files.push({
                name: fileName,
                path: relativePath, // Path relative to the project root
                content: content,
                type: 'file',
                lastModified: new Date().toISOString()
            });
        }

        // Save project to global 'projects' object in local storage
        // Note: Using the global 'projects' variable and 'projectHosterProjects' key
        // Update the global projects object directly with the new project
        projects[project.id] = project;
        saveProjectsToLocalStorage(); // This will save the updated global projects object

        // Close modal and refresh view
        importProjectModal.hide();
        fileInput.value = ''; // Clear the input
        showToast('Project imported successfully!', 'success');
        
        // Reload projects from local storage to ensure global 'projects' is consistent
        // and then re-render the grid
        loadProjectsFromLocalStorage(); 
        renderProjectGrid();
    } catch (error) {
        console.error('Error importing project:', error);
        showToast('Error importing project', 'error');
    }
});

// Helper function to read file content (moved from old app.js)
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        
        const mimeType = getFileMimeType(file.name);
        if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'image/svg+xml') {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file); // For binary files like images
        }
    });
}

// Helper function to determine MIME type based on file extension (moved from old app.js)
function getFileMimeType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'html': return 'text/html';
        case 'css': return 'text/css';
        case 'js': return 'application/javascript';
        case 'json': return 'application/json';
        case 'xml': return 'application/xml';
        case 'md': return 'text/markdown';
        case 'txt': return 'text/plain';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'gif': return 'image/gif';
        case 'bmp': return 'image/bmp';
        case 'webp': return 'image/webp';
        case 'svg': return 'image/svg+xml';
        case 'ico': return 'image/x-icon';
        // Add more common types as needed
        default: return 'application/octet-stream'; // Generic binary type
    }
}

function showProjectPasswordDialog(projectName, projectDescription) {
    const dialog = document.createElement('div');
    dialog.className = 'modal fade';
    dialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Set Project Password</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="projectPassword" class="form-label">Password</label>
                        <input type="password" class="form-control" id="projectPassword" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirmProjectPassword" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirmProjectPassword" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmProjectPasswordBtn">Create Project</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    const modal = new bootstrap.Modal(dialog);
    modal.show();

    const confirmBtn = dialog.querySelector('#confirmProjectPasswordBtn');
    confirmBtn.addEventListener('click', () => {
        const password = dialog.querySelector('#projectPassword').value;
        const confirmPassword = dialog.querySelector('#confirmProjectPassword').value;

        if (!password || !confirmPassword) {
            showToast('Please enter both password fields', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'warning');
            return;
        }

        createNewProject(projectName, projectDescription, password);
        modal.hide();
        dialog.remove();
    });

    dialog.addEventListener('hidden.bs.modal', () => {
        dialog.remove();
    });
}

function createNewProject(projectName, projectDescription, password = null) {
    const newProject = {
        id: Date.now().toString(),
        name: projectName,
        description: projectDescription,
        createdAt: new Date().toISOString(),
        files: [],
        folders: [],
        collaborators: [],
        isPasswordProtected: !!password,
        password: password ? btoa(password) : null // Simple base64 encoding for password
    };

    projects[newProject.id] = newProject;
    saveProjectsToLocalStorage();
    if (createProjectModal) createProjectModal.hide();
    showToast('Project "' + projectName + '" created successfully!', 'success');
    renderProjectGrid();
}

function showProjectAccessPrompt(project) {
    const dialog = document.createElement('div');
    dialog.className = 'modal fade';
    dialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Enter Project Password</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="projectAccessPassword" class="form-label">Password</label>
                        <input type="password" class="form-control" id="projectAccessPassword" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmProjectAccessBtn">Access Project</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    const modal = new bootstrap.Modal(dialog);
    modal.show();

    const confirmBtn = dialog.querySelector('#confirmProjectAccessBtn');
    confirmBtn.addEventListener('click', () => {
        const password = dialog.querySelector('#projectAccessPassword').value;
        const storedPassword = atob(project.password);

        if (password === storedPassword) {
            window.location.href = `index.html?projectId=${project.id}`;
            modal.hide();
        } else {
            showToast('Incorrect password', 'danger');
        }
    });

    dialog.addEventListener('hidden.bs.modal', () => {
        dialog.remove();
    });
}

// Add function to show project context menu
function showProjectContextMenu(x, y) {
    // Adjust context menu position to prevent going off-screen
    const menuWidth = projectContextMenu.offsetWidth;
    const menuHeight = projectContextMenu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalX = x;
    let finalY = y;

    if (x + menuWidth > viewportWidth) {
        finalX = viewportWidth - menuWidth - 10;
    }
    if (y + menuHeight > viewportHeight) {
        finalY = viewportHeight - menuHeight - 10;
    }

    projectContextMenu.style.left = `${finalX}px`;
    projectContextMenu.style.top = `${finalY}px`;
    projectContextMenu.style.display = 'block';
}