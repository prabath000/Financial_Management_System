const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // We can add IPC methods here if needed
    platform: process.platform,
});
