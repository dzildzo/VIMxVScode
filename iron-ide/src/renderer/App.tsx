import React, { useEffect, useState } from 'react';
import { useEditorStore } from './store/editor-store';
import { useFileStore } from './store/file-store';
import FileExplorer from './components/explorer/FileExplorer';
import TabBar from './components/tabs/TabBar';
import EditorComponent from './components/editor/EditorComponent';
import StatusBar from './components/statusbar/StatusBar';
import { ISettings } from '../shared/types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<ISettings | null>(null);
  const { initializeWorkspace } = useFileStore();
  const { setActiveTab } = useEditorStore();

  useEffect(() => {
    // Load settings
    const loadSettings = async () => {
      if (window.electronAPI) {
        const loadedSettings = await window.electronAPI.settings.get();
        setSettings(loadedSettings);
        
        // Listen for settings updates
        const unsubscribe = window.electronAPI.settings.onUpdate((updatedSettings) => {
          setSettings(updatedSettings);
        });

        return unsubscribe;
      }
    };

    loadSettings();
  }, []);

  const handleOpenFolder = async () => {
    if (!window.electronAPI) return;

    try {
      const result = await window.electronAPI.fs.openDialog({
        properties: ['openDirectory'],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const workspacePath = result.filePaths[0];
        await initializeWorkspace(workspacePath);
        
        // Initialize LSP for the workspace
        await window.electronAPI.lsp.initialize(workspacePath);
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  if (!settings) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Iron IDE...</p>
      </div>
    );
  }

  return (
    <div className={`app theme-${settings.theme.theme}`}>
      {/* Title Bar */}
      <header className="title-bar">
        <div className="title-bar-drag-region">
          <span className="app-title">Iron IDE</span>
        </div>
        <div className="title-bar-controls">
          <button 
            className="control-btn minimize"
            onClick={() => window.electronAPI?.window.minimize()}
            aria-label="Minimize"
          >
            −
          </button>
          <button 
            className="control-btn maximize"
            onClick={() => window.electronAPI?.window.maximize()}
            aria-label="Maximize"
          >
            □
          </button>
          <button 
            className="control-btn close"
            onClick={() => window.electronAPI?.window.close()}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Activity Bar (left sidebar icons) */}
        <aside className="activity-bar">
          <div className="activity-item active" title="Explorer">
            📁
          </div>
          <div className="activity-item" title="Search">
            🔍
          </div>
          <div className="activity-item" title="Source Control">
            🌿
          </div>
          <div className="activity-item" title="Debug">
            🐛
          </div>
          <div className="activity-item" title="Extensions">
            🧩
          </div>
        </aside>

        {/* Sidebar (File Explorer) */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">EXPLORER</span>
            <div className="sidebar-actions">
              <button onClick={handleOpenFolder} title="Open Folder">
                📂
              </button>
              <button title="New File">📄</button>
              <button title="New Folder">📁</button>
            </div>
          </div>
          <FileExplorer />
        </aside>

        {/* Editor Area */}
        <main className="editor-area">
          <TabBar />
          <EditorComponent />
        </main>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default App;
