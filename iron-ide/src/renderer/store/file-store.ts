import { create } from 'zustand';
import { IFileNode } from '../../shared/types';

interface FileState {
  workspacePath: string | null;
  fileTree: IFileNode[];
  selectedFileId: string | null;
  expandedDirs: Set<string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeWorkspace: (workspacePath: string) => Promise<void>;
  loadDirectory: (dirPath: string) => Promise<IFileNode[]>;
  selectFile: (fileId: string | null) => void;
  toggleDirectory: (dirId: string) => void;
  refreshFileTree: () => Promise<void>;
  addFileToTree: (parentDirId: string, fileNode: IFileNode) => void;
  removeFileFromTree: (fileId: string) => void;
  updateFileInTree: (fileId: string, updates: Partial<IFileNode>) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  workspacePath: null,
  fileTree: [],
  selectedFileId: null,
  expandedDirs: new Set(),
  isLoading: false,
  error: null,

  initializeWorkspace: async (workspacePath) => {
    set({ isLoading: true, error: null, workspacePath });

    if (!window.electronAPI) {
      set({ isLoading: false, error: 'Electron API not available' });
      return;
    }

    try {
      const tree = await get().loadDirectory(workspacePath);
      
      // Auto-expand the root directory
      const rootId = tree[0]?.id || '';
      const expandedDirs = new Set(get().expandedDirs);
      if (rootId) {
        expandedDirs.add(rootId);
      }

      set({ 
        fileTree: tree, 
        expandedDirs,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load workspace',
      });
    }
  },

  loadDirectory: async (dirPath) => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.fs.readDirectory(dirPath);
    } catch (error) {
      console.error(`Error loading directory ${dirPath}:`, error);
      throw error;
    }
  },

  selectFile: (fileId) => {
    set({ selectedFileId: fileId });
  },

  toggleDirectory: (dirId) => {
    set((state) => {
      const newExpanded = new Set(state.expandedDirs);
      
      if (newExpanded.has(dirId)) {
        newExpanded.delete(dirId);
      } else {
        newExpanded.add(dirId);
        
        // Load children if not already loaded
        const findNode = (nodes: IFileNode[], id: string): IFileNode | null => {
          for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
              const found = findNode(node.children, id);
              if (found) return found;
            }
          }
          return null;
        };

        const dirNode = findNode(state.fileTree, dirId);
        if (dirNode && dirNode.type === 'directory' && !dirNode.children) {
          // Load children asynchronously
          get().loadDirectory(dirNode.path).then((children) => {
            set((s) => ({
              fileTree: s.fileTree.map(node => 
                node.id === dirId ? { ...node, children: children } : node
              ),
            }));
          });
        }
      }

      return { expandedDirs: newExpanded };
    });
  },

  refreshFileTree: async () => {
    const state = get();
    if (!state.workspacePath) return;

    set({ isLoading: true });
    
    try {
      const tree = await get().loadDirectory(state.workspacePath);
      set({ fileTree: tree, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to refresh',
      });
    }
  },

  addFileToTree: (parentDirId, fileNode) => {
    set((state) => ({
      fileTree: state.fileTree.map(node => {
        if (node.id === parentDirId && node.children) {
          return {
            ...node,
            children: [...node.children, fileNode],
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => {
              if (child.id === parentDirId && child.children) {
                return {
                  ...child,
                  children: [...child.children, fileNode],
                };
              }
              return child;
            }),
          };
        }
        return node;
      }),
    }));
  },

  removeFileFromTree: (fileId) => {
    set((state) => {
      const removeFromChildren = (children: IFileNode[]): IFileNode[] => {
        return children
          .filter(child => child.id !== fileId)
          .map(child => ({
            ...child,
            children: child.children ? removeFromChildren(child.children) : undefined,
          }));
      };

      return {
        fileTree: removeFromChildren(state.fileTree),
      };
    });
  },

  updateFileInTree: (fileId, updates) => {
    set((state) => {
      const updateInChildren = (children: IFileNode[]): IFileNode[] => {
        return children.map(child => {
          if (child.id === fileId) {
            return { ...child, ...updates };
          }
          if (child.children) {
            return {
              ...child,
              children: updateInChildren(child.children),
            };
          }
          return child;
        });
      };

      return {
        fileTree: updateInChildren(state.fileTree),
      };
    });
  },
}));
