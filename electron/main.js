const electron = require('electron');
const { app, BrowserWindow, ipcMain, utilityProcess } = electron;
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;

function createBackend() {
    const backendPath = path.join(__dirname, '..', 'server', 'index.js');

    // In production, we need to pass the userData path to the backend
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'data.db');

    console.log('Starting backend process...');
    console.log('Backend Path:', backendPath);
    console.log('Database Path:', dbPath);

    const env = {};
    for (const key in process.env) {
        if (process.env[key] !== undefined) {
            env[key] = String(process.env[key]);
        }
    }
    env.DATABASE_PATH = String(dbPath);
    env.PORT = '5000';
    env.NODE_ENV = isDev ? 'development' : 'production';

    backendProcess = utilityProcess.fork(backendPath, [], {
        env,
        stdio: 'inherit'
    });

    backendProcess.on('exit', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Janaka Agency",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (isDev) {
        // In development, load from Vite dev server
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the built index.html
        mainWindow.loadFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createBackend();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});
