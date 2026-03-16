const { contextBridge, ipcRenderer } = require(‘electron’);
contextBridge.exposeInMainWorld(‘electronAPI’, {
saveCareer: (data) => ipcRenderer.invoke(‘save-career’, data),
loadCareer: ()     => ipcRenderer.invoke(‘load-career’),
});