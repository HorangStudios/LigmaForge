const { contextBridge, ipcRenderer } = require('electron');

//apis
contextBridge.exposeInMainWorld('interface', {
  redirect: (url) => ipcRenderer.invoke('redirect', url),
  openEditor: () => ipcRenderer.invoke('editor'),
  onReceive: (callback) => ipcRenderer.on('updates', (_event, value) => callback(value))
});