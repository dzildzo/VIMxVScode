import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as chokidar from 'chokidar';
import { IFileSystemItem } from '../shared/types';

let mainWindow: BrowserWindow | null = null;
const fileWatchers = new Map<string, chokidar.FSWatcher>();

async function getFileTree(dirPath: string): Promise<IFileSystemItem[]> {
  const result: IFileSystemItem[] = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        result.push({
          name: entry.name,
          path: fullPath,
          type: 'directory',
          children: [],
        });
      } else {
        result.push({
          name: entry.name,
          path: fullPath,
          type: 'file',
        });
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  
  return result;
}

async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error('Error reading file:', error);
    return '';
  }
}

async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
}

function setupIpcHandlers() {
  ipcMain.handle('get-file-tree', async (_event: Electron.IpcMainInvokeEvent, dirPath: string) => {
    return await getFileTree(dirPath);
  });

  ipcMain.handle('read-file', async (_event: Electron.IpcMainInvokeEvent, filePath: string) => {
    return await readFile(filePath);
  });

  ipcMain.handle('write-file', async (_event: Electron.IpcMainInvokeEvent, filePath: string, content: string) => {
    await writeFile(filePath, content);
  });

  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.on('watch-file', (_event: Electron.IpcMainEvent, filePath: string) => {
    if (fileWatchers.has(filePath)) return;
    
    const watcher = chokidar.watch(filePath, { persistent: false });
    
    watcher.on('change', () => {
      mainWindow?.webContents.send('file-changed', { filePath });
    });
    
    fileWatchers.set(filePath, watcher);
  });

  ipcMain.on('unwatch-file', (_event: Electron.IpcMainEvent, filePath: string) => {
    const watcher = fileWatchers.get(filePath);
    if (watcher) {
      watcher.close();
      fileWatchers.delete(filePath);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  fileWatchers.forEach(watcher => watcher.close());
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
