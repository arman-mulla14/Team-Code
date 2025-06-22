const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 8080;
const PROJECTS_FILE = path.join(__dirname, 'projects.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Placeholder for in-memory session (replace with real session management in production)
const sessions = {};

// API endpoint to get project data
app.get('/api/projects', (req, res) => {
    const projectsPath = path.join(__dirname, 'projects');
    if (!fs.existsSync(projectsPath)) {
        fs.mkdirSync(projectsPath);
    }
    
    const projects = fs.readdirSync(projectsPath)
        .filter(file => fs.statSync(path.join(projectsPath, file)).isDirectory())
        .map(project => {
            const projectPath = path.join(projectsPath, project);
            const configPath = path.join(projectPath, 'config.json');
            let config = {};
            
            if (fs.existsSync(configPath)) {
                try {
                    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                } catch (error) {
                    console.error(`Error reading config for ${project}:`, error);
                }
            }
            
            return {
                name: project,
                path: projectPath,
                config: config
            };
        });
    
    res.json(projects);
});

// API endpoint to create a new project
app.post('/api/projects', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
    }

    const projectPath = path.join(__dirname, 'projects', name);
    if (fs.existsSync(projectPath)) {
        return res.status(400).json({ error: 'Project already exists' });
    }

    try {
        fs.mkdirSync(projectPath, { recursive: true });
        const config = {
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        fs.writeFileSync(path.join(projectPath, 'config.json'), JSON.stringify(config, null, 2));
        res.json({ message: 'Project created successfully', path: projectPath });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// API endpoint to delete a project
app.delete('/api/projects/:name', (req, res) => {
    const projectPath = path.join(__dirname, 'projects', req.params.name);
    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({ error: 'Project not found' });
    }

    try {
        fs.rmSync(projectPath, { recursive: true, force: true });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// API endpoint to save file
app.post('/api/save', (req, res) => {
    const { projectName, filePath, content } = req.body;
    if (!projectName || !filePath || content === undefined) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const fullPath = path.join(__dirname, 'projects', projectName, filePath);
    try {
        // Ensure directory exists
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, content);
        res.json({ message: 'File saved successfully' });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// API endpoint to get file content
app.get('/api/file/:projectName/*', (req, res) => {
    const projectName = req.params.projectName;
    const filePath = req.params[0];
    const fullPath = path.join(__dirname, 'projects', projectName, filePath);

    try {
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        res.json({ content });
    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Failed to read file' });
    }
});

// API endpoint to list files in a project
app.get('/api/files/:projectName/*', (req, res) => {
    const projectName = req.params.projectName;
    const dirPath = req.params[0] || '';
    const fullPath = path.join(__dirname, 'projects', projectName, dirPath);

    try {
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Directory not found' });
        }

        const items = fs.readdirSync(fullPath);
        const files = items.map(item => {
            const itemPath = path.join(fullPath, item);
            const stats = fs.statSync(itemPath);
            return {
                name: item,
                path: path.join(dirPath, item),
                isDirectory: stats.isDirectory(),
                size: stats.size,
                modified: stats.mtime
            };
        });

        res.json(files);
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

// API endpoint to delete a file
app.delete('/api/file/:projectName/*', (req, res) => {
    const projectName = req.params.projectName;
    const filePath = req.params[0];
    const fullPath = path.join(__dirname, 'projects', projectName, filePath);

    try {
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        fs.unlinkSync(fullPath);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// API endpoint to create a directory
app.post('/api/directory/:projectName/*', (req, res) => {
    const projectName = req.params.projectName;
    const dirPath = req.params[0];
    const fullPath = path.join(__dirname, 'projects', projectName, dirPath);

    try {
        if (fs.existsSync(fullPath)) {
            return res.status(400).json({ error: 'Directory already exists' });
        }

        fs.mkdirSync(fullPath, { recursive: true });
        res.json({ message: 'Directory created successfully' });
    } catch (error) {
        console.error('Error creating directory:', error);
        res.status(500).json({ error: 'Failed to create directory' });
    }
});

// API endpoint to delete a directory
app.delete('/api/directory/:projectName/*', (req, res) => {
    const projectName = req.params.projectName;
    const dirPath = req.params[0];
    const fullPath = path.join(__dirname, 'projects', projectName, dirPath);

    try {
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Directory not found' });
        }

        fs.rmSync(fullPath, { recursive: true, force: true });
        res.json({ message: 'Directory deleted successfully' });
    } catch (error) {
        console.error('Error deleting directory:', error);
        res.status(500).json({ error: 'Failed to delete directory' });
    }
});

// New API endpoint for Jack's Python Brain
app.post('/api/jack_ask', (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    const pythonProcess = spawn('python', ['jack_brain.py']);

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}, error: ${pythonError}`);
            return res.status(500).json({ message: 'Error processing request with Python brain.', type: 'error' });
        }

        try {
            const response = JSON.parse(pythonOutput);
            res.json(response);
        } catch (parseError) {
            console.error('Failed to parse Python output:', parseError, 'Output:', pythonOutput);
            res.status(500).json({ message: 'Invalid response from Python brain.', type: 'error' });
        }
    });

    // Send prompt to Python script's stdin
    pythonProcess.stdin.write(JSON.stringify({ prompt }));
    pythonProcess.stdin.end();
});

http.createServer(app).listen(PORT, () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`);
}); 