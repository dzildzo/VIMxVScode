import React, { useState } from 'react';
import { IFileSystemItem } from '../../shared/types';

interface FileExplorerProps {
  items: IFileSystemItem[];
  onFileClick: (filePath: string) => void;
  rootFolder: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ items, onFileClick, rootFolder }) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const toggleDirectory = (dirPath: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }
    setExpandedDirs(newExpanded);
  };

  const renderIcon = (item: IFileSystemItem): string => {
    if (item.type === 'directory') {
      return expandedDirs.has(item.path) ? '📂' : '📁';
    }
    
    const ext = item.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return '📘';
      case 'js':
      case 'jsx':
        return '📗';
      case 'py':
        return '🐍';
      case 'go':
        return '🔷';
      case 'rs':
        return '🦀';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'css':
      case 'scss':
        return '🎨';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  };

  const renderItem = (item: IFileSystemItem, depth: number = 0) => {
    const isExpanded = item.type === 'directory' && expandedDirs.has(item.path);
    const paddingLeft = depth * 16 + 8;

    return (
      <div key={item.path}>
        <div
          className={`file-item ${item.type} ${depth > 0 ? 'nested' : ''}`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => {
            if (item.type === 'directory') {
              toggleDirectory(item.path);
            } else {
              onFileClick(item.path);
            }
          }}
        >
          <span className="icon">{renderIcon(item)}</span>
          <span className="name">{item.name}</span>
        </div>
        
        {isExpanded && item.children && item.children.length > 0 && (
          <div>
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-explorer">
      {items.map(item => renderItem(item))}
    </div>
  );
};

export default FileExplorer;
