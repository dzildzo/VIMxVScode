import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getFileTree: (dirPath: string) => ipcRenderer.invoke('get-file-tree', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  watchFile: (filePath: string) => ipcRenderer.send('watch-file', filePath),
  unwatchFile: (filePath: string) => ipcRenderer.send('unwatch-file', filePath),
  onFileChanged: (callback: (data: { filePath: string }) => void) => {
    ipcRenderer.on('file-changed', (_event: Electron.IpcRendererEvent, data: { filePath: string }) => callback(data));
  },
});
