import React, { useEffect } from 'react';
import { useFileStore } from '../../store/file-store';
import FileTreeNode from './FileTreeNode';

const FileExplorer: React.FC = () => {
  const { fileTree, expandedDirs, isLoading, error } = useFileStore();

  if (isLoading) {
    return (
      <div className="file-explorer loading">
        <div className="loading-indicator">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-explorer error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (fileTree.length === 0) {
    return (
      <div className="file-explorer empty">
        <p>No folder opened</p>
        <button onClick={() => {}}>Open Folder</button>
      </div>
    );
  }

  return (
    <div className="file-explorer">
      <div className="file-tree">
        {fileTree.map((node) => (
          <FileTreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
