import React, { useState, useEffect, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { IFileTab, IFileSystemItem } from '../shared/types';
import { getLanguageIdFromExtension, createModelForFile } from '../shared/utils';
import FileExplorer from './components/FileExplorer';
import TabBar from './components/TabBar';
import './App.css';

declare global {
  interface Window {
    electronAPI: {
      getFileTree: (dirPath: string) => Promise<IFileSystemItem[]>;
      readFile: (filePath: string) => Promise<string>;
      writeFile: (filePath: string, content: string) => Promise<void>;
      selectFolder: () => Promise<string | null>;
      watchFile: (filePath: string) => void;
      unwatchFile: (filePath: string) => void;
      onFileChanged: (callback: (data: { filePath: string }) => void) => void;
    };
  }
}

const App: React.FC = () => {
  const [rootFolder, setRootFolder] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<IFileSystemItem[]>([]);
  const [tabs, setTabs] = useState<IFileTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [editorContainerRef, setEditorContainerRef] = useState<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorContainerRef && !editor) {
      const monacoEditor = monaco.editor.create(editorContainerRef, {
        value: '',
        language: 'plaintext',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 14,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
      });

      setEditor(monacoEditor);

      return () => {
        monacoEditor.dispose();
      };
    }
  }, [editorContainerRef]);

  useEffect(() => {
    if (editor && activeTabId) {
      const activeTab = tabs.find(t => t.id === activeTabId);
      if (activeTab) {
        const model = createModelForFile(activeTab.path, activeTab.content);
        editor.setModel(model);
      }
    }
  }, [editor, activeTabId, tabs]);

  const loadFileTree = useCallback(async (folderPath: string) => {
    try {
      const tree = await window.electronAPI.getFileTree(folderPath);
      setFileTree(tree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
    }
  }, []);

  const handleSelectFolder = async () => {
    const folderPath = await window.electronAPI.selectFolder();
    if (folderPath) {
      setRootFolder(folderPath);
      loadFileTree(folderPath);
    }
  };

  const handleOpenFile = async (filePath: string) => {
    try {
      const content = await window.electronAPI.readFile(filePath);
      const extension = filePath.split('.').pop() || '';
      const languageId = getLanguageIdFromExtension(extension);
      
      const existingTab = tabs.find(t => t.path === filePath);
      
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }
      
      const newTab: IFileTab = {
        id: `tab-${Date.now()}`,
        path: filePath,
        content,
        isDirty: false,
        languageId,
      };
      
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      
      window.electronAPI.watchFile(filePath);
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  const handleCloseTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      window.electronAPI.unwatchFile(tab.path);
    }
    
    setTabs(prev => prev.filter(t => t.id !== tabId));
    
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(t => t.id !== tabId);
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null);
    }
  };

  const handleContentChange = useCallback((newContent: string) => {
    if (!activeTabId) return;
    
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return { ...tab, content: newContent, isDirty: true };
      }
      return tab;
    }));
  }, [activeTabId]);

  const handleSaveFile = async () => {
    if (!activeTabId) return;
    
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab || !editor) return;
    
    try {
      const content = editor.getValue();
      await window.electronAPI.writeFile(activeTab.path, content);
      
      setTabs(prev => prev.map(tab => {
        if (tab.id === activeTabId) {
          return { ...tab, content, isDirty: false };
        }
        return tab;
      }));
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile]);

  useEffect(() => {
    window.electronAPI.onFileChanged(({ filePath }) => {
      const tab = tabs.find(t => t.path === filePath);
      if (tab && !tab.isDirty) {
        window.electronAPI.readFile(filePath).then(content => {
          setTabs(prev => prev.map(t => {
            if (t.path === filePath) {
              return { ...t, content };
            }
            return t;
          }));
          
          if (activeTabId === tab.id && editor) {
            const model = createModelForFile(filePath, content);
            editor.setModel(model);
          }
        });
      }
    });
  }, [tabs, activeTabId, editor]);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <button onClick={handleSelectFolder}>
            {rootFolder ? 'Change Folder' : 'Open Folder'}
          </button>
        </div>
        {rootFolder && (
          <FileExplorer 
            items={fileTree} 
            onFileClick={handleOpenFile}
            rootFolder={rootFolder}
          />
        )}
      </div>
      
      <div className="main-content">
        <TabBar 
          tabs={tabs} 
          activeTabId={activeTabId} 
          onTabClick={setActiveTabId}
          onTabClose={handleCloseTab}
        />
        
        <div 
          ref={setEditorContainerRef} 
          className="editor-container"
        />
      </div>
    </div>
  );
};

export default App;
