import fs from 'fs-extra';
import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import { v4 as uuidv4 } from 'uuid';
import { IFileNode, FileSystemEvent, ISettings } from '../../shared/types';

export class FileSystemManager {
  private watcher: FSWatcher | null = null;
  private eventListeners: Map<string, Set<(event: FileSystemEvent) => void>> = new Map();
  private settings: ISettings['files'] = {
    exclude: ['**/node_modules/**', '**/.git/**'],
    watchExclude: ['**/node_modules/**', '**/.git/**'],
    maxFileSize: 5 * 1024 * 1024,
  };

  constructor() {
    // Initialize with default settings
  }

  public updateSettings(settings: ISettings['files']): void {
    this.settings = settings;
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  public async readDirectory(dirPath: string, depth: number = 0, maxDepth: number = 5): Promise<IFileNode[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const nodes: IFileNode[] = [];

      for (const entry of entries) {
        // Skip excluded patterns
        if (this.shouldExclude(entry.name)) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        const node: IFileNode = {
          id: uuidv4(),
          name: entry.name,
          path: fullPath,
          type: entry.isDirectory() ? 'directory' : 'file',
          depth,
          isOpen: false,
        };

        if (entry.isDirectory() && depth < maxDepth) {
          try {
            node.children = await this.readDirectory(fullPath, depth + 1, maxDepth);
          } catch (error) {
            console.warn(`Cannot read directory ${fullPath}:`, error);
            node.children = [];
          }
        }

        nodes.push(node);
      }

      // Sort: directories first, then files, alphabetically
      return nodes.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'directory' ? -1 : 1;
      });
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
      throw error;
    }
  }

  public async readFile(filePath: string): Promise<string> {
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.size > this.settings.maxFileSize) {
        throw new Error(`File is too large (${stats.size} bytes). Max size is ${this.settings.maxFileSize} bytes.`);
      }

      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw error;
    }
  }

  public async createFile(filePath: string): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, '', 'utf-8');
    } catch (error) {
      console.error(`Error creating file ${filePath}:`, error);
      throw error;
    }
  }

  public async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.ensureDir(dirPath);
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  }

  public async delete(targetPath: string): Promise<void> {
    try {
      await fs.remove(targetPath);
    } catch (error) {
      console.error(`Error deleting ${targetPath}:`, error);
      throw error;
    }
  }

  public async rename(oldPath: string, newPath: string): Promise<void> {
    try {
      await fs.rename(oldPath, newPath);
    } catch (error) {
      console.error(`Error renaming ${oldPath} to ${newPath}:`, error);
      throw error;
    }
  }

  public async exists(targetPath: string): Promise<boolean> {
    try {
      return await fs.pathExists(targetPath);
    } catch (error) {
      console.error(`Error checking existence of ${targetPath}:`, error);
      return false;
    }
  }

  public async stat(targetPath: string): Promise<fs.Stats> {
    return await fs.stat(targetPath);
  }

  public startWatching(rootPath: string, callback: (event: FileSystemEvent) => void): void {
    if (this.watcher) {
      this.watcher.close();
    }

    const ignored = [...this.settings.watchExclude, '**/.*'];
    
    this.watcher = chokidar.watch(rootPath, {
      ignored,
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false,
      usePolling: process.platform === 'linux',
      interval: 1000,
      binaryInterval: 2000,
    });

    const emitEvent = (type: FileSystemEvent['type'], targetPath: string) => {
      callback({ type, path: targetPath });
    };

    this.watcher
      .on('add', (p) => emitEvent('add', p))
      .on('change', (p) => emitEvent('change', p))
      .on('unlink', (p) => emitEvent('unlink', p))
      .on('addDir', (p) => emitEvent('addDir', p))
      .on('unlinkDir', (p) => emitEvent('unlinkDir', p))
      .on('error', (error) => console.error('Watcher error:', error));
  }

  public stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  public onEvent(eventType: string, callback: (event: FileSystemEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  public offEvent(eventType: string, callback: (event: FileSystemEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private shouldExclude(name: string): boolean {
    const excludePatterns = this.settings.exclude;
    return excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      return regex.test(name);
    });
  }

  public dispose(): void {
    this.stopWatching();
    this.eventListeners.clear();
  }
}
