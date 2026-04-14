import { contextBridge, ipcRenderer } from 'electron';
import { ISettings, IFileNode, FileSystemEvent, IIpcRequest } from '../shared/types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File System Operations
  fs: {
    readDirectory: (dirPath: string): Promise<IFileNode[]> => 
      ipcRenderer.invoke('fs:readDirectory', dirPath),
    
    readFile: (filePath: string): Promise<string> => 
      ipcRenderer.invoke('fs:readFile', filePath),
    
    writeFile: (filePath: string, content: string): Promise<void> => 
      ipcRenderer.invoke('fs:writeFile', filePath, content),
    
    createFile: (filePath: string): Promise<void> => 
      ipcRenderer.invoke('fs:createFile', filePath),
    
    createDirectory: (dirPath: string): Promise<void> => 
      ipcRenderer.invoke('fs:createDirectory', dirPath),
    
    delete: (targetPath: string): Promise<void> => 
      ipcRenderer.invoke('fs:delete', targetPath),
    
    rename: (oldPath: string, newPath: string): Promise<void> => 
      ipcRenderer.invoke('fs:rename', oldPath, newPath),
    
    openDialog: (options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> => 
      ipcRenderer.invoke('fs:openDialog', options),
    
    saveDialog: (options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue> => 
      ipcRenderer.invoke('fs:saveDialog', options),
  },

  // LSP Operations
  lsp: {
    initialize: (workspacePath: string): Promise<void> => 
      ipcRenderer.invoke('lsp:initialize', workspacePath),
    
    shutdown: (): Promise<void> => 
      ipcRenderer.invoke('lsp:shutdown'),
    
    sendRequest: (languageId: string, method: string, params: unknown): Promise<unknown> => 
      ipcRenderer.invoke('lsp:sendRequest', languageId, method, params),
  },

  // Settings Operations
  settings: {
    get: (): Promise<ISettings> => 
      ipcRenderer.invoke('settings:get'),
    
    update: (newSettings: Partial<ISettings>): Promise<void> => 
      ipcRenderer.invoke('settings:update', newSettings),
    
    onUpdate: (callback: (settings: ISettings) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, settings: ISettings) => {
        callback(settings);
      };
      ipcRenderer.on('settings:updated', listener);
      return () => ipcRenderer.removeListener('settings:updated', listener);
    },
  },

  // Window Operations
  window: {
    minimize: (): Promise<void> => 
      ipcRenderer.invoke('window:minimize'),
    
    maximize: (): Promise<void> => 
      ipcRenderer.invoke('window:maximize'),
    
    close: (): Promise<void> => 
      ipcRenderer.invoke('window:close'),
  },

  // App Info
  app: {
    getVersion: (): Promise<string> => 
      ipcRenderer.invoke('app:getVersion'),
    
    getPlatform: (): Promise<NodeJS.Platform> => 
      ipcRenderer.invoke('app:getPlatform'),
  },

  // Event Listeners
  onFileSystemEvent: (callback: (event: FileSystemEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, event: FileSystemEvent) => {
      callback(event);
    };
    ipcRenderer.on('fs:event', listener);
    return () => ipcRenderer.removeListener('fs:event', listener);
  },

  // Platform info
  platform: process.platform,
  isElectron: true,
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      fs: {
        readDirectory: (dirPath: string) => Promise<IFileNode[]>;
        readFile: (filePath: string) => Promise<string>;
        writeFile: (filePath: string, content: string) => Promise<void>;
        createFile: (filePath: string) => Promise<void>;
        createDirectory: (dirPath: string) => Promise<void>;
        delete: (targetPath: string) => Promise<void>;
        rename: (oldPath: string, newPath: string) => Promise<void>;
        openDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;
        saveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
      };
      lsp: {
        initialize: (workspacePath: string) => Promise<void>;
        shutdown: () => Promise<void>;
        sendRequest: (languageId: string, method: string, params: unknown) => Promise<unknown>;
      };
      settings: {
        get: () => Promise<ISettings>;
        update: (newSettings: Partial<ISettings>) => Promise<void>;
        onUpdate: (callback: (settings: ISettings) => void) => () => void;
      };
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
      };
      app: {
        getVersion: () => Promise<string>;
        getPlatform: () => Promise<NodeJS.Platform>;
      };
      onFileSystemEvent: (callback: (event: FileSystemEvent) => void) => () => void;
      platform: NodeJS.Platform;
      isElectron: boolean;
    };
  }
}
