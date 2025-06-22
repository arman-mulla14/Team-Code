// JavaScript for the editor page (index.html)

// DOM Elements (Editor specific)
const sidebar = document.getElementById('sidebar');
const fileExplorer = document.getElementById('fileExplorer');
const newFileBtn = document.getElementById('newFileBtn');
const newFolderBtn = document.getElementById('newFolderBtn');
const saveBtn = document.getElementById('saveBtn');
const liveServerBtn = document.getElementById('liveServerBtn');
const codeEditor = document.getElementById('codeEditor');
const collaborationStatus = document.getElementById('collaborationStatus');
const backToProjectsBtn = document.getElementById('backToProjectsBtn');
const customContextMenu = document.getElementById('customContextMenu');
const contextMenuNewFile = document.getElementById('contextMenuNewFile');
const contextMenuNewFolder = document.getElementById('contextMenuNewFolder');
const contextMenuOpen = document.getElementById('contextMenuOpen');
const contextMenuDelete = document.getElementById('contextMenuDelete');
const contextMenuCopy = document.getElementById('contextMenuCopy');
const contextMenuCut = document.getElementById('contextMenuCut');

// Current project state for editor
let currentProject = null; // Stores the active project object
let activeFile = null; // To keep track of the currently open file
let contextMenuItemPath = ''; // To store the path of the item clicked
let contextMenuItemType = ''; // To store 'file' or 'folder'
let currentPath = ''; // Root directory

// Flag to prevent multiple inline inputs
let isCreatingNewItem = false;

// Global projects object for editor's local storage interaction
let projects = {}; // All projects loaded from localStorage

// Autocomplete DOM Element
const autocompleteSuggestions = document.getElementById('autocompleteSuggestions');
let activeSuggestionIndex = -1;
const htmlTags = [
    'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style',
    'div', 'p', 'span', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'input', 'form', 'label',
    'header', 'footer', 'nav', 'main', 'section', 'article', 'aside',
    'figure', 'figcaption', 'video', 'audio', 'canvas', 'svg', 'blockquote',
    'code', 'pre', 'em', 'strong', 'br', 'hr', 'abbr', 'cite', 'dfn', 'kbd',
    'samp', 'var', 'b', 'i', 'u', 's', 'del', 'ins', 'sub', 'sup',
    'datalist', 'option', 'select', 'textarea', 'fieldset', 'legend',
    'iframe', 'embed', 'object', 'param', 'source', 'track',
    'details', 'summary', 'dialog', 'menu', 'menuitem',
    'picture', 'map', 'area', 'progress', 'meter', 'time',
    'wbr', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'cite', 'q', 'data',
    'keygen', 'output', 'template', 'slot'
];

// Add clipboard state variables at the top with other state variables
let clipboardItem = null;
let clipboardOperation = null; // 'copy' or 'cut'

// Local Storage Functions (duplicated from main.js to allow editor to save)
function saveProjectsToLocalStorage() {
    localStorage.setItem('projectHosterProjects', JSON.stringify(projects));
}

function loadProjectsFromLocalStorage() {
    const storedProjects = localStorage.getItem('projectHosterProjects');
    if (storedProjects) {
        projects = JSON.parse(storedProjects);
    } else {
        projects = {}; // Initialize as an empty object if nothing found
    }
    console.log('Projects loaded in editor from Local Storage:', projects);
}

// Function to load project editor (triggered from main.html)
function loadProjectEditor(projectId) {
    console.log('loadProjectEditor called with projectId:', projectId); // Debug log
    
    loadProjectsFromLocalStorage(); // Load all projects first
    console.log('Loaded projects:', projects); // Debug log

    if (!projectId) {
        console.error('No project ID provided'); // Debug log
        showToast('No project selected. Redirecting to projects page.', 'warning');
        window.location.href = 'main.html';
        return;
    }

    if (Object.keys(projects).length === 0) {
        console.error('No projects found in storage'); // Debug log
        showToast('No projects found. Redirecting to projects page.', 'warning');
        window.location.href = 'main.html';
        return;
    }

    currentProject = projects[projectId];
    console.log('Current project:', currentProject); // Debug log

    if (!currentProject) {
        console.error('Project not found:', projectId); // Debug log
        showToast('Project not found!', 'danger');
        window.location.href = 'main.html';
        return;
    }

    // Initialize project arrays if they don't exist
    if (!currentProject.files) {
        console.log('Initializing files array'); // Debug log
        currentProject.files = [];
    }
    if (!currentProject.folders) {
        console.log('Initializing folders array'); // Debug log
        currentProject.folders = [];
    }

    // Reset current path to root
    currentPath = '';
    console.log('Reset current path to root'); // Debug log

    // Display editor elements
    sidebar.style.display = 'block';
    document.querySelector('.editor-content-wrapper').style.display = 'flex';
    collaborationStatus.style.display = 'flex';

    // Update file explorer with current project files and folders
    updateFileExplorer(currentProject.files, currentProject.folders);
    showToast(`Project "${currentProject.name}" loaded successfully!`, 'success');

    // Start live server immediately after loading project
    startLiveServer();

    // Initialize the Terminal (Chat Bot)
    console.log('Initializing Terminal...'); // Debug log
    const terminal = new Terminal();
    console.log('Terminal instance:', terminal); // Debug log

    // Make the chat bot visible if a project was loaded
    if (projectId) {
        console.log('projectId exists, attempting to toggleVisibility...'); // Debug log
        terminal.toggleVisibility();
    } else {
        console.log('projectId is null or empty, not toggling visibility.'); // Debug log
    }
}

// Event Listeners (Editor specific)
backToProjectsBtn.addEventListener('click', () => {
    console.log('Back to Projects Button Clicked in editor.js');
    // Save current project state before leaving
    if (activeFile && currentProject) {
        saveFileContent(activeFile.path, codeEditor.value);
    }
    window.location.href = 'main.html'; // Navigate back to the main projects page
});

saveBtn.addEventListener('click', () => {
    console.log('Save Button Clicked');
    if (activeFile && currentProject) {
        saveFileContent(activeFile.path, codeEditor.value);
    }
});

codeEditor.addEventListener('input', () => {
    if (activeFile && currentProject) {
        saveFileContent(activeFile.path, codeEditor.value, true); // True for silent update
    }
});

liveServerBtn.addEventListener('click', () => {
    console.log('Live Server Button Clicked');
    let htmlContentToDisplay = '';
    let targetFile = null;

    if (activeFile && activeFile.type === 'file' && activeFile.name.endsWith('.html')) {
        targetFile = activeFile;
    } else if (currentProject) {
        // If no specific HTML file is active, try to find an index.html in the project root
        targetFile = currentProject.files.find(file => file.path === 'index.html' && file.type === 'file');
    }

    if (targetFile) {
        htmlContentToDisplay = targetFile.content;

        // Embed CSS files
        htmlContentToDisplay = htmlContentToDisplay.replace(/<link\s+rel="stylesheet"\s+href="(.*?)">/g, (match, cssPath) => {
            const fullPath = getFullPath(cssPath, targetFile.path);
            const cssFile = currentProject.files.find(f => f.path === fullPath && f.type === 'file');
            if (cssFile) {
                return `<style>${cssFile.content}</style>`;
            } else {
                console.warn(`CSS file not found in project: ${cssPath}`);
                return match; // Return original tag if file not found
            }
        });

        // Embed JavaScript files
        htmlContentToDisplay = htmlContentToDisplay.replace(/<script\s+src="(.*?)"([^>]*)><\/script>/g, (match, jsPath, attributes) => {
            const fullPath = getFullPath(jsPath, targetFile.path);
            const jsFile = currentProject.files.find(f => f.path === fullPath && f.type === 'file');
            if (jsFile) {
                return `<script${attributes}>${jsFile.content}</script>`;
            } else {
                console.warn(`JavaScript file not found in project: ${jsPath}`);
                return match; // Return original tag if file not found
            }
        });

        // Embed images (handle <img> tags)
        htmlContentToDisplay = htmlContentToDisplay.replace(/<img\s+src="(.*?)"([^>]*)>/g, (match, imagePath, attributes) => {
            const fullPath = getFullPath(imagePath, targetFile.path);
            const imageFile = currentProject.files.find(f => f.path === fullPath && f.type === 'file');
            if (imageFile && imageFile.content.startsWith('data:')) {
                // Replace src with the Data URL
                return `<img src="${imageFile.content}"${attributes}>`;
            } else {
                console.warn(`Image file not found or not a Data URL: ${imagePath}`);
                return match; // Return original tag if file not found or not suitable
            }
        });

        // Embed favicon (handle <link rel="icon" ...> tags)
        htmlContentToDisplay = htmlContentToDisplay.replace(/<link\s+rel="(?:icon|shortcut\s+icon|apple-touch-icon)"\s+href="(.*?)"([^>]*)>/g, (match, iconPath, attributes) => {
            const fullPath = getFullPath(iconPath, targetFile.path);
            const iconFile = currentProject.files.find(f => f.path === fullPath && f.type === 'file');
            if (iconFile && iconFile.content.startsWith('data:')) {
                // Replace href with the Data URL
                return `<link rel="icon" href="${iconFile.content}"${attributes}>`;
            } else {
                console.warn(`Favicon file not found or not a Data URL: ${iconPath}`);
                return match; // Return original tag if file not found or not suitable
            }
        });

        const blob = new Blob([htmlContentToDisplay], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        showToast(`Opened ${targetFile.name} in Live Server!`, 'success');
    } else {
        showToast('No HTML file open or index.html found in project root.', 'warning');
    }
});

// Helper function to resolve full path for embedding (New)
function getFullPath(relativePath, currentFilePath) {
    const currentDirParts = currentFilePath.split('/');
    currentDirParts.pop(); // Remove file name to get directory
    
    const pathParts = relativePath.split('/');
    let resolvedParts = [...currentDirParts];

    for (const part of pathParts) {
        if (part === '..') {
            resolvedParts.pop(); // Go up one directory
        } else if (part !== '.' && part !== '') {
            resolvedParts.push(part);
        }
    }
    return resolvedParts.join('/');
}

// Event listeners for new toolbar buttons
if (newFileBtn) {
    newFileBtn.addEventListener('click', () => {
        console.log('New File Button Clicked');
        if (!currentProject) {
            showToast('Please open a project first to create files.', 'warning');
            return;
        }
        if (isCreatingNewItem) return; // Prevent multiple inputs
        createInlineInput('file');
    });
}

if (newFolderBtn) {
    newFolderBtn.addEventListener('click', () => {
        console.log('New Folder Button Clicked');
        if (!currentProject) {
            showToast('Please open a project first to create folders.', 'warning');
            return;
        }
        if (isCreatingNewItem) return; // Prevent multiple inputs
        createInlineInput('folder');
    });
}

// Context Menu Event Listeners
customContextMenu.addEventListener('click', (e) => {
    // Ensure the click is on a menu item, not the menu background
    if (e.target.classList.contains('context-menu-item')) {
        customContextMenu.style.display = 'none';
    }
});

contextMenuOpen.addEventListener('click', () => {
    if (contextMenuItemType === 'file') {
        const file = currentProject.files.find(f => f.path === contextMenuItemPath);
        if (file) loadFile(file);
    } else if (contextMenuItemType === 'folder') {
        currentPath = contextMenuItemPath;
        updateFileExplorer(currentProject.files, currentProject.folders);
    }
});

contextMenuDelete.addEventListener('click', () => {
    if (contextMenuItemType === 'file') {
        deleteFile(contextMenuItemPath);
    } else if (contextMenuItemType === 'folder') {
        deleteFolder(contextMenuItemPath);
    }
    customContextMenu.style.display = 'none';
});

contextMenuCopy.addEventListener('click', () => {
    if (contextMenuItemType === 'file') {
        const file = currentProject.files.find(f => f.path === contextMenuItemPath);
        if (file) {
            clipboardItem = { ...file };
            clipboardOperation = 'copy';
            showToast(`File "${file.name}" copied to clipboard`, 'success');
        }
    } else if (contextMenuItemType === 'folder') {
        const folder = currentProject.folders.find(f => f.path === contextMenuItemPath);
        if (folder) {
            clipboardItem = { ...folder };
            clipboardOperation = 'cut';
            showToast(`Folder "${folder.name}" copied to clipboard`, 'success');
        }
    }
    customContextMenu.style.display = 'none';
});

contextMenuCut.addEventListener('click', () => {
    if (contextMenuItemType === 'file') {
        const file = currentProject.files.find(f => f.path === contextMenuItemPath);
        if (file) {
            clipboardItem = { ...file };
            clipboardOperation = 'cut';
            showToast(`File "${file.name}" cut to clipboard`, 'success');
        }
    } else if (contextMenuItemType === 'folder') {
        const folder = currentProject.folders.find(f => f.path === contextMenuItemPath);
        if (folder) {
            clipboardItem = { ...folder };
            clipboardOperation = 'cut';
            showToast(`Folder "${folder.name}" cut to clipboard`, 'success');
        }
    }
    customContextMenu.style.display = 'none';
});

// Add paste functionality to the context menu
const contextMenuPaste = document.getElementById('contextMenuPaste');
if (contextMenuPaste) {
    contextMenuPaste.addEventListener('click', () => {
        if (!clipboardItem) {
            showToast('Nothing to paste', 'warning');
            return;
        }

        const targetPath = currentPath ? `${currentPath}/` : '';
        const newName = clipboardItem.name;
        const newPath = `${targetPath}${newName}`;

        if (clipboardItem.type === 'file') {
            // Check if file already exists
            if (currentProject.files.some(f => f.path === newPath)) {
                showToast(`File "${newName}" already exists in this location`, 'warning');
                return;
            }

            // Create new file
            const newFile = {
                ...clipboardItem,
                path: newPath
            };
            currentProject.files.push(newFile);

            // If it was a cut operation, delete the original
            if (clipboardOperation === 'cut') {
                currentProject.files = currentProject.files.filter(f => f.path !== clipboardItem.path);
            }
        } else if (clipboardItem.type === 'folder') {
            // Check if folder already exists
            if (currentProject.folders.some(f => f.path === newPath)) {
                showToast(`Folder "${newName}" already exists in this location`, 'warning');
                return;
            }

            // Create new folder
            const newFolder = {
                ...clipboardItem,
                path: newPath
            };
            currentProject.folders.push(newFolder);

            // If it was a cut operation, delete the original
            if (clipboardOperation === 'cut') {
                currentProject.folders = currentProject.folders.filter(f => f.path !== clipboardItem.path);
            }
        }

        saveProjectsToLocalStorage();
        updateFileExplorer(currentProject.files, currentProject.folders);
        showToast(`Pasted "${newName}" successfully`, 'success');
        customContextMenu.style.display = 'none';
    });
}

// Hide context menu when clicking anywhere else
document.addEventListener('click', () => {
    customContextMenu.style.display = 'none';
});

// Show context menu on right-click within file explorer area
fileExplorer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // Only show if clicking on the background of the file explorer, not on an item
    if (e.target === fileExplorer || e.target.id === 'fileExplorer') {
        showContextMenu(e.clientX, e.clientY, '', 'background'); // No specific item, indicate background click
    } else if (e.target.closest('.file') || e.target.closest('.folder')) {
        // If click is on a file/folder item, existing context menu logic applies
        // The event listener for individual items will handle this.
    } else {
        customContextMenu.style.display = 'none'; // Hide if click is on unexpected element
    }
});

// Project Editor Functions
function updateFileExplorer(files, folders) {
    console.log('Updating file explorer with:', { files, folders }); // Debug log
    
    if (!fileExplorer) {
        console.error('File explorer element not found'); // Debug log
        return;
    }

    fileExplorer.innerHTML = ''; // Clear existing content

    // Ensure files and folders are arrays
    const currentFiles = Array.isArray(files) ? files : [];
    const currentFolders = Array.isArray(folders) ? folders : [];

    // Add 'Go Up' button if not at root
    if (currentPath !== '') {
        const goUpLi = document.createElement('li');
        goUpLi.className = 'folder';
        goUpLi.innerHTML = `
            <span class="folder-icon"><i class="mdi mdi-arrow-up-bold-box"></i></span>
            <span class="folder-name">..</span>
        `;
        goUpLi.addEventListener('click', () => goUpDirectory());
        fileExplorer.appendChild(goUpLi);
    }

    // Filter and sort items for the current level
    const filteredFolders = currentFolders.filter(f => {
        const folderParentPath = f.path.substring(0, f.path.lastIndexOf('/'));
        return folderParentPath === currentPath;
    }).sort((a, b) => a.name.localeCompare(b.name));

    const filteredFiles = currentFiles.filter(file => {
        const fileParentPath = file.path.substring(0, file.path.lastIndexOf('/'));
        return fileParentPath === currentPath;
    }).sort((a, b) => a.name.localeCompare(b.name));

    console.log('Filtered items:', { filteredFolders, filteredFiles }); // Debug log

    // Display folders
    filteredFolders.forEach(folder => {
        const li = document.createElement('li');
        li.className = 'folder';
        li.innerHTML = `
            <span class="folder-icon"><i class="mdi mdi-folder"></i></span>
            <span class="folder-name">${folder.name}</span>
            ${folder.isPasswordProtected ? '<span class="badge bg-warning ms-2"><i class="mdi mdi-lock"></i></span>' : ''}
        `;

        let pressTimerFolder;
        let isLongPressFolder = false;

        li.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault(); // Prevent default touch behavior (e.g., scrolling)
                isLongPressFolder = false; // Reset flag
                pressTimerFolder = setTimeout(() => {
                    isLongPressFolder = true;
                    showContextMenu(e.touches[0].clientX, e.touches[0].clientY, folder.path, 'folder');
                }, 700); // 700ms for a long press
            }
        }, { passive: false }); // Use passive: false to allow preventDefault

        li.addEventListener('touchend', () => {
            clearTimeout(pressTimerFolder);
        });

        li.addEventListener('touchmove', () => {
            clearTimeout(pressTimerFolder);
        });

        li.addEventListener('click', (e) => {
            if (isLongPressFolder) {
                isLongPressFolder = false; // Reset for next interaction
                return; // Prevent click if it was a long press
            }
            console.log(`Folder clicked: ${folder.name}`); // Debug log
            if (folder.isPasswordProtected) {
                showFolderPasswordPrompt(folder);
            } else {
                currentPath = folder.path;
                updateFileExplorer(currentProject.files, currentProject.folders);
            }
        });
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, folder.path, 'folder');
        });
        fileExplorer.appendChild(li);
    });

    // Display files
    filteredFiles.forEach(file => {
        const li = document.createElement('li');
        li.className = 'file';
        const iconClass = getFileIconClass(file.name);
        li.innerHTML = `
            <span class="file-icon"><i class="mdi ${iconClass}"></i></span>
            <span class="file-name">${file.name}</span>
        `;
        
        let pressTimerFile;
        let isLongPressFile = false;

        li.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault(); // Prevent default touch behavior (e.g., scrolling)
                isLongPressFile = false; // Reset flag
                pressTimerFile = setTimeout(() => {
                    isLongPressFile = true;
                    showContextMenu(e.touches[0].clientX, e.touches[0].clientY, file.path, 'file');
                }, 700); // 700ms for a long press
            }
        }, { passive: false }); // Use passive: false to allow preventDefault

        li.addEventListener('touchend', () => {
            clearTimeout(pressTimerFile);
        });

        li.addEventListener('touchmove', () => {
            clearTimeout(pressTimerFile);
        });

        li.addEventListener('click', (event) => {
            if (isLongPressFile) {
                isLongPressFile = false; // Reset for next interaction
                return; // Prevent click if it was a long press
            }
            console.log(`File clicked: ${file.name}`); // Debug log
            loadFile(file);
        });
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, file.path, 'file');
        });
        fileExplorer.appendChild(li);
    });
}

function processFileSystemEntry(entry, parentPath = '') {
    if (entry.isFile) {
        entry.file((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const filePath = parentPath ? `${parentPath}/${file.name}` : file.name;
                createNewFile(filePath, content); // Pass full path to createNewFile
            };
            reader.readAsText(file);
        });
    } else if (entry.isDirectory) {
        const dirPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
        createNewFolder(dirPath); // Pass full path to createNewFolder
        
        const dirReader = entry.createReader();
        dirReader.readEntries((entries) => {
            entries.forEach((entry) => {
                processFileSystemEntry(entry, dirPath);
            });
        });
    }
}

function createNewFile(filePath, content = '') {
    if (!currentProject) {
        showToast('Please open a project first to create files.', 'warning');
        return;
    }

    const fileName = filePath.split('/').pop(); // Extract file name from path
    const existingFile = currentProject.files.find(file => file.path === filePath);
    if (existingFile) {
        showToast(`File "${fileName}" already exists at this path.`, 'warning');
        return;
    }

    const newFile = {
        name: fileName,
        path: filePath,
        type: 'file',
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    currentProject.files.push(newFile);
    saveProjectsToLocalStorage();
    updateFileExplorer(currentProject.files, currentProject.folders);
    showToast(`File "${fileName}" created successfully!`, 'success');
    loadFile(newFile); // Open the new file immediately
}

function createInlineInput(type) {
    if (isCreatingNewItem) return; // Prevent multiple inputs
    isCreatingNewItem = true;

    const li = document.createElement('li');
    li.className = 'file-input-item';
    
    if (type === 'folder') {
        li.innerHTML = `
            <span class="file-icon"><i class="mdi mdi-folder-plus"></i></span>
            <div class="d-flex align-items-center">
                <input type="text" class="form-control form-control-sm d-inline-block w-auto ms-2" placeholder="New folder name">
                <div class="form-check ms-2">
                    <input class="form-check-input" type="checkbox" id="passwordProtect">
                    <label class="form-check-label" for="passwordProtect">Password Protect</label>
                </div>
            </div>
        `;
    } else {
        li.innerHTML = `
            <span class="file-icon"><i class="mdi mdi-file-plus"></i></span>
            <input type="text" class="form-control form-control-sm d-inline-block w-auto ms-2" placeholder="New file name">
        `;
    }
    
    fileExplorer.prepend(li);

    const input = li.querySelector('input[type="text"]');
    input.focus();

    const cleanup = () => {
        li.remove();
        isCreatingNewItem = false;
    };

    input.addEventListener('blur', () => {
        cleanup();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const itemName = input.value.trim();
            if (itemName) {
                const fullPath = currentPath ? `${currentPath}/${itemName}` : itemName;
                if (type === 'file') {
                    createNewFile(fullPath);
                } else {
                    const passwordProtect = li.querySelector('#passwordProtect').checked;
                    if (passwordProtect) {
                        showPasswordDialog(fullPath);
                    } else {
                        createNewFolder(fullPath);
                    }
                }
            } else {
                showToast(`New ${type} name cannot be empty.`, 'warning');
            }
            cleanup();
        } else if (e.key === 'Escape') {
            cleanup();
        }
    });
}

function goUpDirectory() {
    const pathParts = currentPath.split('/').filter(part => part !== '');
    if (pathParts.length > 0) {
        pathParts.pop();
        currentPath = pathParts.join('/');
        updateFileExplorer(currentProject.files, currentProject.folders);
    } else {
        showToast('Already at the root directory.', 'info');
    }
}

function showContextMenu(x, y, path, type) {
    contextMenuItemPath = path;
    contextMenuItemType = type;

    // Adjust context menu position to prevent going off-screen
    const menuWidth = customContextMenu.offsetWidth;
    const menuHeight = customContextMenu.offsetHeight;
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

    customContextMenu.style.left = `${finalX}px`;
    customContextMenu.style.top = `${finalY}px`;
    customContextMenu.style.display = 'block';

    // Show/hide context menu items based on type
    if (type === 'background') {
        contextMenuOpen.style.display = 'none';
        contextMenuDelete.style.display = 'none';
        contextMenuCopy.style.display = 'none';
        contextMenuCut.style.display = 'none';
        contextMenuNewFile.style.display = 'block';
        contextMenuNewFolder.style.display = 'block';
        contextMenuPaste.style.display = clipboardItem ? 'block' : 'none';
    } else {
        contextMenuOpen.style.display = 'block';
        contextMenuDelete.style.display = 'block';
        contextMenuCopy.style.display = 'block';
        contextMenuCut.style.display = 'block';
        contextMenuNewFile.style.display = 'none';
        contextMenuNewFolder.style.display = 'none';
        contextMenuPaste.style.display = 'none';
    }
}

function createNewFolder(folderPath, password = null) {
    console.log('Creating new folder:', folderPath); // Debug log

    if (!currentProject) {
        console.error('No current project found'); // Debug log
        showToast('Please open a project first to create folders.', 'warning');
        return;
    }

    // Ensure folders array exists
    if (!currentProject.folders) {
        currentProject.folders = [];
    }

    const folderName = folderPath.split('/').pop();
    console.log('Folder name:', folderName); // Debug log

    // Check if folder already exists
    const existingFolder = currentProject.folders.find(folder => folder.path === folderPath);
    if (existingFolder) {
        console.log('Folder already exists:', existingFolder); // Debug log
        showToast(`Folder "${folderName}" already exists at this path.`, 'warning');
        return;
    }

    // Create new folder object
    const newFolder = {
        name: folderName,
        path: folderPath,
        type: 'folder',
        createdAt: new Date().toISOString(),
        isPasswordProtected: !!password,
        password: password ? btoa(password) : null // Simple base64 encoding for password
    };

    console.log('Adding new folder:', newFolder); // Debug log

    // Add folder to project
    currentProject.folders.push(newFolder);
    
    // Save to localStorage
    saveProjectsToLocalStorage();
    
    // Update UI
    updateFileExplorer(currentProject.files, currentProject.folders);
    showToast(`Folder "${folderName}" created successfully!`, 'success');
}

function deleteFile(filePath) {
    if (confirm(`Are you sure you want to delete "${filePath}"?`)) {
        currentProject.files = currentProject.files.filter(file => file.path !== filePath);
        saveProjectsToLocalStorage();
        updateFileExplorer(currentProject.files, currentProject.folders);
        codeEditor.value = ''; // Clear editor if the active file was deleted
        activeFile = null;
        showToast(`File "${filePath.split('/').pop()}" deleted successfully!`, 'success');
    }
}

function deleteFolder(folderPath) {
    const folder = currentProject.folders.find(f => f.path === folderPath);
    
    if (!folder) {
        showToast('Folder not found!', 'danger');
        return;
    }

    if (folder.isPasswordProtected) {
        showDeleteFolderPasswordPrompt(folder);
    } else {
        confirmAndDeleteFolder(folderPath);
    }
}

function showDeleteFolderPasswordPrompt(folder) {
    const dialog = document.createElement('div');
    dialog.className = 'modal fade';
    dialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Enter Folder Password to Delete</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="deleteFolderPassword" class="form-label">Password</label>
                        <input type="password" class="form-control" id="deleteFolderPassword" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteFolderBtn">Delete Folder</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    const modal = new bootstrap.Modal(dialog);
    modal.show();

    const confirmBtn = dialog.querySelector('#confirmDeleteFolderBtn');
    confirmBtn.addEventListener('click', () => {
        const password = dialog.querySelector('#deleteFolderPassword').value;
        const storedPassword = atob(folder.password);

        if (password === storedPassword) {
            confirmAndDeleteFolder(folder.path);
            modal.hide();
        } else {
            showToast('Incorrect password', 'danger');
        }
    });

    dialog.addEventListener('hidden.bs.modal', () => {
        dialog.remove();
    });
}

function confirmAndDeleteFolder(folderPath) {
    if (confirm(`Are you sure you want to delete the folder "${folderPath}" and all its contents?`)) {
        // Filter out the folder and all its descendant files/folders
        currentProject.folders = currentProject.folders.filter(folder => !folder.path.startsWith(folderPath));
        currentProject.files = currentProject.files.filter(file => !file.path.startsWith(folderPath));
        saveProjectsToLocalStorage();
        updateFileExplorer(currentProject.files, currentProject.folders);
        showToast(`Folder "${folderPath.split('/').pop()}" and its contents deleted successfully!`, 'success');
    }
}

function loadFile(file) {
    activeFile = file;
    codeEditor.value = file.content;
    showToast(`Opened file: ${file.name}`, 'info');
}

function saveFileContent(filePath, content, silent = false) {
    const fileIndex = currentProject.files.findIndex(file => file.path === filePath);
    if (fileIndex !== -1) {
        currentProject.files[fileIndex].content = content;
        currentProject.files[fileIndex].updatedAt = new Date().toISOString();
        saveProjectsToLocalStorage();
        if (!silent) {
            showToast(`File "${filePath.split('/').pop()}" saved successfully!`, 'success');
        }
    }
}

function startLiveServer() {
    // Live server functionality already embedded, no need to start a separate server.
    // This function can be used to trigger the preview logic or simply be a placeholder.
    console.log('Live server placeholder called.');
}

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

function getFileIconClass(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'html':
            return 'mdi-language-html5';
        case 'css':
            return 'mdi-language-css3';
        case 'js':
            return 'mdi-language-javascript';
        case 'py':
            return 'mdi-language-python';
        case 'md':
            return 'mdi-language-markdown';
        case 'json':
            return 'mdi-json';
        case 'webmanifest':
            return 'mdi-web';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
            return 'mdi-file-image';
        case 'zip':
        case 'rar':
        case '7z':
            return 'mdi-file-zip';
        case 'pdf':
            return 'mdi-file-pdf-box';
        case 'doc':
        case 'docx':
            return 'mdi-file-word';
        case 'xls':
        case 'xlsx':
            return 'mdi-file-excel';
        case 'ppt':
        case 'pptx':
            return 'mdi-file-powerpoint';
        case 'mp3':
        case 'wav':
        case 'ogg':
            return 'mdi-file-music';
        case 'mp4':
        case 'avi':
        case 'mov':
            return 'mdi-file-video';
        case 'txt':
            return 'mdi-file-document-outline';
        default:
            return 'mdi-file-document';
    }
}

// Drag and Drop (from app.js - needs to be adapted for editor.js)
// This part handles dropping files/folders onto the file explorer
// It should be initialized once for the fileExplorer element
fileExplorer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileExplorer.classList.add('drag-over');
});

fileExplorer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileExplorer.classList.remove('drag-over');
});

fileExplorer.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileExplorer.classList.remove('drag-over');
    
    const items = e.dataTransfer.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                processFileSystemEntry(entry);
            }
        }
    }
});

// Initialize editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get project ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
    
    if (projectId) {
        loadProjectEditor(projectId);
    } else {
        showToast('No project selected. Redirecting to projects page.', 'warning');
        window.location.href = 'main.html';
    }
});

// Function to read file content (used in live server)
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e.target.error);
        reader.readAsText(file);
    });
}

// Function to get MIME type (used in live server for embedding)
function getFileMimeType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
        case 'html': return 'text/html';
        case 'css': return 'text/css';
        case 'js': return 'application/javascript';
        case 'json': return 'application/json';
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif': return 'image/gif';
        case 'svg': return 'image/svg+xml';
        case 'txt': return 'text/plain';
        case 'pdf': return 'application/pdf';
        // Add more as needed
        default: return 'application/octet-stream';
    }
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        // This function should ideally be handled in main.js, 
        // as it pertains to the project list management.
        // For now, it's a placeholder here to prevent errors if called.
        showToast('Project deletion should be handled from the projects page.', 'info');
        // To actually delete from here, we'd need to modify `projects` and save:
        // delete projects[projectId];
        // saveProjectsToLocalStorage();
        // window.location.href = 'main.html'; // Redirect after deletion
    }
}

// Basic HTML Tag Auto-completion (New Feature)
codeEditor.addEventListener('keyup', (e) => {
    const cursorPosition = codeEditor.selectionStart;
    const textBeforeCursor = codeEditor.value.substring(0, cursorPosition);
    const lastChar = textBeforeCursor.slice(-1);
    const previousTwoChars = textBeforeCursor.slice(-2);

    if (lastChar === '<' && previousTwoChars !== '<!--') {
        showAutocompleteSuggestions('');
    } else if (previousTwoChars.startsWith('<') && lastChar.match(/[a-zA-Z]/)) {
        const tagNameMatch = textBeforeCursor.match(/<([a-zA-Z]+)$/);
        if (tagNameMatch) {
            showAutocompleteSuggestions(tagNameMatch[1]);
        } else {
            hideAutocompleteSuggestions();
        }
    } else {
        hideAutocompleteSuggestions();
    }
});

codeEditor.addEventListener('keydown', (e) => {
    if (autocompleteSuggestions.style.display === 'block') {
        const suggestions = Array.from(autocompleteSuggestions.children);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestions.length;
            highlightActiveSuggestion(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
            highlightActiveSuggestion(suggestions);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (activeSuggestionIndex !== -1) {
                e.preventDefault();
                insertSuggestion(suggestions[activeSuggestionIndex].textContent);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            hideAutocompleteSuggestions();
        }
    }
});

function showAutocompleteSuggestions(filterText) {
    autocompleteSuggestions.innerHTML = '';
    activeSuggestionIndex = -1;

    const filteredTags = htmlTags.filter(tag => tag.startsWith(filterText.toLowerCase()));

    if (filteredTags.length > 0) {
        filteredTags.forEach((tag, index) => {
            const div = document.createElement('div');
            div.textContent = tag;
            div.addEventListener('click', () => insertSuggestion(tag));
            autocompleteSuggestions.appendChild(div);
        });

        // Position the suggestions box
        const cursorPosition = getCursorCoordinates();
        autocompleteSuggestions.style.left = `${cursorPosition.left}px`;
        autocompleteSuggestions.style.top = `${cursorPosition.top + 20}px`; // Adjust 20px for line height
        autocompleteSuggestions.style.display = 'block';
    } else {
        hideAutocompleteSuggestions();
    }
}

function hideAutocompleteSuggestions() {
    autocompleteSuggestions.style.display = 'none';
    autocompleteSuggestions.innerHTML = '';
    activeSuggestionIndex = -1;
}

function highlightActiveSuggestion(suggestions) {
    suggestions.forEach((s, i) => {
        s.classList.toggle('active-suggestion', i === activeSuggestionIndex);
    });
    if (activeSuggestionIndex !== -1) {
        suggestions[activeSuggestionIndex].scrollIntoView({ block: 'nearest' });
    }
}

function insertSuggestion(tag) {
    const cursorPosition = codeEditor.selectionStart;
    const textBeforeCursor = codeEditor.value.substring(0, cursorPosition);
    const tagNameMatch = textBeforeCursor.match(/<([a-zA-Z]*)$/);

    let newText = '';
    if (tagNameMatch && tagNameMatch[1] !== undefined) {
        // Replace partially typed tag
        const startOfTag = cursorPosition - tagNameMatch[1].length;
        newText = codeEditor.value.substring(0, startOfTag) + `<${tag}>` + codeEditor.value.substring(cursorPosition);
    } else {
        // Insert new tag
        newText = codeEditor.value.substring(0, cursorPosition) + `<${tag}>` + codeEditor.value.substring(cursorPosition);
    }
    
    codeEditor.value = newText;
    const newCursorPosition = cursorPosition + tag.length + 2; // +2 for < and >
    codeEditor.selectionStart = newCursorPosition;
    codeEditor.selectionEnd = newCursorPosition;
    
    hideAutocompleteSuggestions();
    codeEditor.focus(); // Ensure editor is focused after insertion
}

// Helper to get approximate cursor coordinates (for positioning suggestions)
function getCursorCoordinates() {
    const editorRect = codeEditor.getBoundingClientRect();
    const text = codeEditor.value.substring(0, codeEditor.selectionStart);
    const lines = text.split('\n');
    const currentLine = lines.length - 1;
    const currentColumn = lines[currentLine].length;

    // Approximate character width and line height (monospace font assumed)
    const charWidth = 7.5; // This might need fine-tuning based on your font-size
    const lineHeight = 20; // This might need fine-tuning based on your font-size

    const left = editorRect.left + currentColumn * charWidth;
    const top = editorRect.top + currentLine * lineHeight;

    return { left, top };
}

function showPasswordDialog(folderPath) {
    const dialog = document.createElement('div');
    dialog.className = 'modal fade';
    dialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Set Folder Password</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="folderPassword" class="form-label">Password</label>
                        <input type="password" class="form-control" id="folderPassword" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirmPassword" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirmPassword" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmPasswordBtn">Create Folder</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    const modal = new bootstrap.Modal(dialog);
    modal.show();

    const confirmBtn = dialog.querySelector('#confirmPasswordBtn');
    confirmBtn.addEventListener('click', () => {
        const password = dialog.querySelector('#folderPassword').value;
        const confirmPassword = dialog.querySelector('#confirmPassword').value;

        if (!password || !confirmPassword) {
            showToast('Please enter both password fields', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'warning');
            return;
        }

        createNewFolder(folderPath, password);
        modal.hide();
        dialog.remove();
    });

    dialog.addEventListener('hidden.bs.modal', () => {
        dialog.remove();
    });
}

function showFolderPasswordPrompt(folder) {
    const dialog = document.createElement('div');
    dialog.className = 'modal fade';
    dialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Enter Folder Password</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="folderPassword" class="form-label">Password</label>
                        <input type="password" class="form-control" id="folderPassword" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmPasswordBtn">Access Folder</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    const modal = new bootstrap.Modal(dialog);
    modal.show();

    const confirmBtn = dialog.querySelector('#confirmPasswordBtn');
    confirmBtn.addEventListener('click', () => {
        const password = dialog.querySelector('#folderPassword').value;
        const storedPassword = atob(folder.password); // Decode stored password

        if (password === storedPassword) {
            currentPath = folder.path;
            updateFileExplorer(currentProject.files, currentProject.folders);
            modal.hide();
        } else {
            showToast('Incorrect password', 'danger');
        }
    });

    dialog.addEventListener('hidden.bs.modal', () => {
        dialog.remove();
    });
}

// AI Assistant features
class EditorAssistant {
    constructor(editor) {
        this.editor = editor;
        this.setupAssistant();
    }

    setupAssistant() {
        // Add AI suggestion button to toolbar
        const toolbar = document.querySelector('.editor-toolbar');
        const aiButton = document.createElement('button');
        aiButton.className = 'btn btn-outline-primary me-2';
        aiButton.innerHTML = '<i class="mdi mdi-robot"></i> AI Assistant';
        aiButton.title = 'Get AI assistance';
        aiButton.onclick = () => this.showAssistantPanel();
        toolbar.insertBefore(aiButton, toolbar.firstChild);

        // Create assistant panel
        this.createAssistantPanel();
    }

    createAssistantPanel() {
        const panel = document.createElement('div');
        panel.className = 'assistant-panel';
        panel.innerHTML = `
            <div class="assistant-header">
                <h5>AI Assistant</h5>
                <button class="btn-close" onclick="this.closest('.assistant-panel').classList.remove('show')"></button>
            </div>
            <div class="assistant-content">
                <div class="assistant-tabs">
                    <button class="tab-btn active" data-tab="suggestions">Suggestions</button>
                    <button class="tab-btn" data-tab="explain">Explain</button>
                    <button class="tab-btn" data-tab="fix">Fix Issues</button>
                </div>
                <div class="tab-content">
                    <div class="tab-pane active" id="suggestions">
                        <div class="suggestions-list"></div>
                    </div>
                    <div class="tab-pane" id="explain">
                        <div class="explanation-content"></div>
                    </div>
                    <div class="tab-pane" id="fix">
                        <div class="fix-suggestions"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;
        this.setupTabs();
    }

    setupTabs() {
        const tabs = this.panel.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                this.panel.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                const tabId = tab.dataset.tab;
                this.panel.querySelector(`#${tabId}`).classList.add('active');
                
                // Update content based on tab
                this.updateTabContent(tabId);
            });
        });
    }

    showAssistantPanel() {
        this.panel.classList.add('show');
        this.updateTabContent('suggestions');
    }

    updateTabContent(tabId) {
        const currentCode = this.editor.getValue();
        
        switch(tabId) {
            case 'suggestions':
                this.getSuggestions(currentCode);
                break;
            case 'explain':
                this.explainCode(currentCode);
                break;
            case 'fix':
                this.findIssues(currentCode);
                break;
        }
    }

    getSuggestions(code) {
        const suggestionsList = this.panel.querySelector('.suggestions-list');
        suggestionsList.innerHTML = '<div class="loading">Analyzing code...</div>';

        // Analyze code and provide suggestions
        const suggestions = this.analyzeCode(code);
        suggestionsList.innerHTML = suggestions.map(s => `
            <div class="suggestion-item">
                <div class="suggestion-header">
                    <i class="mdi mdi-lightbulb"></i>
                    <span>${s.title}</span>
                </div>
                <div class="suggestion-content">${s.content}</div>
                ${s.code ? `<pre><code>${s.code}</code></pre>` : ''}
                ${s.apply ? `<button class="btn btn-sm btn-primary" onclick="editorAssistant.applySuggestion('${s.id}')">Apply</button>` : ''}
            </div>
        `).join('');
    }

    explainCode(code) {
        const explanationContent = this.panel.querySelector('.explanation-content');
        explanationContent.innerHTML = '<div class="loading">Analyzing code...</div>';

        // Generate code explanation
        const explanation = this.generateExplanation(code);
        explanationContent.innerHTML = `
            <div class="explanation-section">
                <h6>Code Overview</h6>
                <p>${explanation.overview}</p>
            </div>
            <div class="explanation-section">
                <h6>Key Components</h6>
                <ul>
                    ${explanation.components.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            <div class="explanation-section">
                <h6>Best Practices</h6>
                <ul>
                    ${explanation.bestPractices.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    findIssues(code) {
        const fixSuggestions = this.panel.querySelector('.fix-suggestions');
        fixSuggestions.innerHTML = '<div class="loading">Analyzing code...</div>';

        // Find and suggest fixes for issues
        const issues = this.findCodeIssues(code);
        fixSuggestions.innerHTML = issues.map(issue => `
            <div class="issue-item">
                <div class="issue-header">
                    <i class="mdi mdi-alert"></i>
                    <span>${issue.title}</span>
                </div>
                <div class="issue-content">${issue.description}</div>
                ${issue.fix ? `
                    <div class="issue-fix">
                        <h6>Suggested Fix:</h6>
                        <pre><code>${issue.fix}</code></pre>
                        <button class="btn btn-sm btn-primary" onclick="editorAssistant.applyFix('${issue.id}')">Apply Fix</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    analyzeCode(code) {
        // This is where you would integrate with an AI service
        // For now, we'll return some example suggestions
        return [
            {
                id: 's1',
                title: 'Consider using async/await',
                content: 'This code could be simplified using async/await syntax.',
                code: 'async function example() {\n  const result = await someAsyncOperation();\n  return result;\n}',
                apply: true
            },
            {
                id: 's2',
                title: 'Add error handling',
                content: 'Add try-catch blocks to handle potential errors.',
                code: 'try {\n  // Your code here\n} catch (error) {\n  console.error(error);\n}',
                apply: true
            }
        ];
    }

    generateExplanation(code) {
        // This is where you would integrate with an AI service
        return {
            overview: 'This code implements a function that processes data and returns a result.',
            components: [
                'Data validation',
                'Processing logic',
                'Result formatting'
            ],
            bestPractices: [
                'Use meaningful variable names',
                'Add comments for complex logic',
                'Handle edge cases'
            ]
        };
    }

    findCodeIssues(code) {
        // This is where you would integrate with an AI service
        return [
            {
                id: 'i1',
                title: 'Missing error handling',
                description: 'The code doesn\'t handle potential errors that could occur.',
                fix: 'try {\n  // Your code here\n} catch (error) {\n  console.error(error);\n}'
            },
            {
                id: 'i2',
                title: 'Inefficient loop',
                description: 'The loop could be optimized for better performance.',
                fix: '// Use map or filter instead of for loop\nconst result = array.map(item => process(item));'
            }
        ];
    }

    applySuggestion(suggestionId) {
        // Apply the selected suggestion to the editor
        const suggestion = this.analyzeCode(this.editor.getValue())
            .find(s => s.id === suggestionId);
        
        if (suggestion && suggestion.code) {
            this.editor.setValue(suggestion.code);
            this.showToast('Suggestion applied successfully!', 'success');
        }
    }

    applyFix(issueId) {
        // Apply the selected fix to the editor
        const issue = this.findCodeIssues(this.editor.getValue())
            .find(i => i.id === issueId);
        
        if (issue && issue.fix) {
            this.editor.setValue(issue.fix);
            this.showToast('Fix applied successfully!', 'success');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Add CSS for the assistant panel
const style = document.createElement('style');
style.textContent = `
    .assistant-panel {
        position: fixed;
        right: -400px;
        top: 0;
        width: 400px;
        height: 100vh;
        background: #fff;
        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        transition: right 0.3s ease;
        z-index: 1000;
    }

    .assistant-panel.show {
        right: 0;
    }

    .assistant-header {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .assistant-content {
        padding: 1rem;
        height: calc(100vh - 60px);
        overflow-y: auto;
    }

    .assistant-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .tab-btn {
        padding: 0.5rem 1rem;
        border: none;
        background: none;
        cursor: pointer;
        border-bottom: 2px solid transparent;
    }

    .tab-btn.active {
        border-bottom-color: #007bff;
        color: #007bff;
    }

    .tab-pane {
        display: none;
    }

    .tab-pane.active {
        display: block;
    }

    .suggestion-item, .issue-item {
        margin-bottom: 1rem;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 4px;
    }

    .suggestion-header, .issue-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .suggestion-content, .issue-content {
        margin-bottom: 0.5rem;
    }

    pre {
        background: #f8f9fa;
        padding: 0.5rem;
        border-radius: 4px;
        margin: 0.5rem 0;
    }

    .loading {
        text-align: center;
        padding: 1rem;
        color: #666;
    }

    .toast {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        color: white;
        z-index: 1001;
    }

    .toast-success {
        background: #28a745;
    }

    .toast-error {
        background: #dc3545;
    }

    .toast-info {
        background: #17a2b8;
    }
`;
document.head.appendChild(style);

// Initialize the editor assistant when the editor is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for editor to be initialized
    const checkEditor = setInterval(() => {
        if (window.editor) {
            clearInterval(checkEditor);
            window.editorAssistant = new EditorAssistant(window.editor);
        }
    }, 100);
}); 