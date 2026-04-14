import { ipcMain, app, BrowserWindow, dialog, shell } from 'electron';
import path from 'path';
import { FileSystemManager } from './fs/file-system-manager';
import { LspManager } from './lsp/lsp-manager';
import { WindowManager } from './window/window-manager';
import { ISettings, IFileNode, IIpcRequest, IIpcResponse } from '../../shared/types';

const defaultSettings: ISettings = {
  editor: {
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    tabSize: 2,
    insertSpaces: true,
    minimap: true,
    wordWrap: 'off',
    autoSave: 'afterDelay',
    autoSaveDelay: 1000,
  },
  files: {
    exclude: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/*.min.js',
      '**/package-lock.json',
    ],
    watchExclude: ['**/node_modules/**', '**/.git/**'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  lsp: {
    enabled: true,
    servers: {
      typescript: {
        command: 'tsserver',
        args: [],
        enabled: true,
      },
      python: {
        command: 'pyright-langserver',
        args: ['--stdio'],
        enabled: true,
      },
      go: {
        command: 'gopls',
        args: [],
        enabled: true,
      },
      rust: {
        command: 'rust-analyzer',
        args: [],
        enabled: true,
      },
    },
  },
  theme: {
    theme: 'dark',
  },
};

export class IronApp {
  private mainWindow: BrowserWindow | null = null;
  private fileSystemManager: FileSystemManager;
  private lspManager: LspManager;
  private windowManager: WindowManager;
  private settings: ISettings = defaultSettings;

  constructor() {
    this.fileSystemManager = new FileSystemManager();
    this.lspManager = new LspManager();
    this.windowManager = new WindowManager();
    
    this.setupIpcHandlers();
    this.setupAppLifecycle();
  }

  private setupAppLifecycle(): void {
    app.whenReady().then(() => {
      this.createMainWindow();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.cleanup();
        app.quit();
      }
    });

    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', () => {
      this.cleanup();
    });
  }

  private createMainWindow(): void {
    const { width, height } = this.windowManager.getDefaultSize();
    
    this.mainWindow = new BrowserWindow({
      width,
      height,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#1e1e1e',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      icon: path.join(__dirname, '../../assets/icon.png'),
    });

    // Load the app
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIpcHandlers(): void {
    // File System Operations
    ipcMain.handle('fs:readDirectory', async (_, dirPath: string): Promise<IFileNode[]> => {
      try {
        return await this.fileSystemManager.readDirectory(dirPath);
      } catch (error) {
        console.error('Error reading directory:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:readFile', async (_, filePath: string): Promise<string> => {
      try {
        return await this.fileSystemManager.readFile(filePath);
      } catch (error) {
        console.error('Error reading file:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string): Promise<void> => {
      try {
        await this.fileSystemManager.writeFile(filePath, content);
      } catch (error) {
        console.error('Error writing file:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:createFile', async (_, filePath: string): Promise<void> => {
      try {
        await this.fileSystemManager.createFile(filePath);
      } catch (error) {
        console.error('Error creating file:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:createDirectory', async (_, dirPath: string): Promise<void> => {
      try {
        await this.fileSystemManager.createDirectory(dirPath);
      } catch (error) {
        console.error('Error creating directory:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:delete', async (_, targetPath: string): Promise<void> => {
      try {
        await this.fileSystemManager.delete(targetPath);
      } catch (error) {
        console.error('Error deleting:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:rename', async (_, oldPath: string, newPath: string): Promise<void> => {
      try {
        await this.fileSystemManager.rename(oldPath, newPath);
      } catch (error) {
        console.error('Error renaming:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:openDialog', async (_, options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> => {
      if (!this.mainWindow) {
        return { canceled: true, filePaths: [] };
      }
      return await dialog.showOpenDialog(this.mainWindow, options);
    });

    ipcMain.handle('fs:saveDialog', async (_, options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue> => {
      if (!this.mainWindow) {
        return { canceled: true, filePath: '' };
      }
      return await dialog.showSaveDialog(this.mainWindow, options);
    });

    // LSP Operations
    ipcMain.handle('lsp:initialize', async (_, workspacePath: string): Promise<void> => {
      try {
        await this.lspManager.initialize(workspacePath, this.settings.lsp);
      } catch (error) {
        console.error('Error initializing LSP:', error);
        throw error;
      }
    });

    ipcMain.handle('lsp:shutdown', async (): Promise<void> => {
      await this.lspManager.shutdown();
    });

    ipcMain.handle('lsp:sendRequest', async (_, languageId: string, method: string, params: unknown): Promise<unknown> => {
      try {
        return await this.lspManager.sendRequest(languageId, method, params);
      } catch (error) {
        console.error('Error sending LSP request:', error);
        throw error;
      }
    });

    // Settings Operations
    ipcMain.handle('settings:get', (): ISettings => {
      return this.settings;
    });

    ipcMain.handle('settings:update', (_, newSettings: Partial<ISettings>): void => {
      this.settings = { ...this.settings, ...newSettings };
      this.lspManager.updateSettings(this.settings.lsp);
      
      if (this.mainWindow) {
        this.mainWindow.webContents.send('settings:updated', this.settings);
      }
    });

    // Window Operations
    ipcMain.handle('window:minimize', (): void => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', (): void => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', (): void => {
      this.mainWindow?.close();
    });

    // App Info
    ipcMain.handle('app:getVersion', (): string => {
      return app.getVersion();
    });

    ipcMain.handle('app:getPlatform', (): NodeJS.Platform => {
      return process.platform;
    });
  }

  private cleanup(): void {
    this.lspManager.shutdown();
    this.fileSystemManager.dispose();
  }

  public getWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}

// Start the application
const ironApp = new IronApp();

export default ironApp;
