import React from 'react';
import { useEditorStore } from '../../store/editor-store';

const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();

  if (tabs.length === 0) {
    return null;
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCloseClick = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      closeTab(tabId);
    }
  };

  return (
    <div className="tab-bar">
      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.isActive ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            onMouseDown={(e) => handleMiddleClick(e, tab.id)}
            role="tab"
            aria-selected={tab.isActive}
          >
            <span className="tab-icon">{getFileIcon(tab.fileName)}</span>
            <span className="tab-name">{tab.fileName}</span>
            {tab.isDirty && <span className="dirty-indicator">●</span>}
            <button
              className="tab-close"
              onClick={(e) => handleCloseClick(e, tab.id)}
              aria-label={`Close ${tab.fileName}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="tab-bar-actions">
        <button className="action-btn" title="Split Editor Right">
          ➡️
        </button>
        <button className="action-btn" title="More Actions">
          ⋯
        </button>
      </div>
    </div>
  );
};

function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  const iconMap: Record<string, string> = {
    ts: '📘',
    tsx: '⚛️',
    js: '📜',
    jsx: '⚛️',
    py: '🐍',
    go: '🔷',
    rs: '🦀',
    json: '📋',
    md: '📝',
    css: '🎨',
    html: '🌐',
  };

  return iconMap[ext] || '📄';
}

export default TabBar;
