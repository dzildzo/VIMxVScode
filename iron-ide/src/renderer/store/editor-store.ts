import { create } from 'zustand';
import { IEditorTab, ICursorPosition } from '../../shared/types';

interface EditorState {
  tabs: IEditorTab[];
  activeTabId: string | null;
  editorInstance: monaco.editor.IStandaloneCodeEditor | null;
  
  // Actions
  addTab: (tab: Omit<IEditorTab, 'id' | 'isActive'>) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  updateTabDirty: (tabId: string, isDirty: boolean) => void;
  updateTabCursor: (tabId: string, position: ICursorPosition) => void;
  setEditorInstance: (editor: monaco.editor.IStandaloneCodeEditor | null) => void;
  getActiveTab: () => IEditorTab | null;
  saveAllTabs: () => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  editorInstance: null,

  addTab: (tabData) => {
    const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    set((state) => {
      // Check if tab for this file already exists
      const existingTab = state.tabs.find(t => t.filePath === tabData.filePath);
      if (existingTab) {
        return {
          ...state,
          activeTabId: existingTab.id,
          tabs: state.tabs.map(t => ({
            ...t,
            isActive: t.id === existingTab.id,
          })),
        };
      }

      const newTab: IEditorTab = {
        ...tabData,
        id,
        isActive: true,
      };

      return {
        tabs: [...state.tabs.map(t => ({ ...t, isActive: false })), newTab],
        activeTabId: id,
      };
    });

    return id;
  },

  closeTab: (tabId) => {
    set((state) => {
      const newTabs = state.tabs.filter(t => t.id !== tabId);
      
      if (newTabs.length === 0) {
        return {
          tabs: [],
          activeTabId: null,
        };
      }

      // If closing active tab, activate another one
      let newActiveId = state.activeTabId;
      if (state.activeTabId === tabId) {
        const closedIndex = state.tabs.findIndex(t => t.id === tabId);
        const newActiveIndex = Math.min(closedIndex, newTabs.length - 1);
        newActiveId = newTabs[newActiveIndex].id;
      }

      return {
        tabs: newTabs.map(t => ({
          ...t,
          isActive: t.id === newActiveId,
        })),
        activeTabId: newActiveId,
      };
    });
  },

  setActiveTab: (tabId) => {
    set((state) => ({
      tabs: state.tabs.map(t => ({
        ...t,
        isActive: t.id === tabId,
      })),
      activeTabId: tabId,
    }));
  },

  updateTabContent: (tabId, content) => {
    set((state) => ({
      tabs: state.tabs.map(t => 
        t.id === tabId ? { ...t, content } : t
      ),
    }));
  },

  updateTabDirty: (tabId, isDirty) => {
    set((state) => ({
      tabs: state.tabs.map(t => 
        t.id === tabId ? { ...t, isDirty } : t
      ),
    }));
  },

  updateTabCursor: (tabId, position) => {
    set((state) => ({
      tabs: state.tabs.map(t => 
        t.id === tabId ? { ...t, cursorPosition: position } : t
      ),
    }));
  },

  setEditorInstance: (editor) => {
    set({ editorInstance: editor });
  },

  getActiveTab: () => {
    const state = get();
    return state.tabs.find(t => t.isActive) || null;
  },

  saveAllTabs: async () => {
    const state = get();
    const dirtyTabs = state.tabs.filter(t => t.isDirty);

    if (!window.electronAPI) {
      console.warn('Electron API not available');
      return;
    }

    for (const tab of dirtyTabs) {
      try {
        await window.electronAPI.fs.writeFile(tab.filePath, tab.content);
        
        set((s) => ({
          tabs: s.tabs.map(t => 
            t.id === tab.id ? { ...t, isDirty: false } : t
          ),
        }));
      } catch (error) {
        console.error(`Error saving ${tab.filePath}:`, error);
      }
    }
  },
}));
