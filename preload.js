const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadData: () => ipcRenderer.invoke('load-data'),
    saveData: (rows) => ipcRenderer.invoke('save-data', rows)
});
