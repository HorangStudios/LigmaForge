const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('interface', {
  redirect: (url) => ipcRenderer.invoke('redirect', url)
})