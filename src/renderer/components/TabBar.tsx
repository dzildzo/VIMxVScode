import React from 'react';
import { IFileTab } from '../../shared/types';

interface TabBarProps {
  tabs: IFileTab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ 
  tabs, 
  activeTabId, 
  onTabClick, 
  onTabClose 
}) => {
  const getFilename = (path: string): string => {
    return path.split(/[\\/]/).pop() || path;
  };

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="filename">{getFilename(tab.path)}</span>
          <span
            className="close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            ×
          </span>
        </div>
      ))}
    </div>
  );
};

export default TabBar;
