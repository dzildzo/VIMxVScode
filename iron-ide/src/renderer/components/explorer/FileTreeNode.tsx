import React from 'react';
import { useFileStore } from '../../store/file-store';
import { useEditorStore } from '../../store/editor-store';
import { IFileNode } from '../../../shared/types';

interface FileTreeNodeProps {
  node: IFileNode;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node }) => {
  const { expandedDirs, selectFile, toggleDirectory, selectedFileId } = useFileStore();
  const { addTab } = useEditorStore();

  const isExpanded = expandedDirs.has(node.id);
  const isSelected = selectedFileId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = async () => {
    if (node.type === 'directory') {
      toggleDirectory(node.id);
    } else {
      selectFile(node.id);
      
      // Open file in editor
      try {
        if (!window.electronAPI) return;
        
        const content = await window.electronAPI.fs.readFile(node.path);
        const languageId = getLanguageIdFromPath(node.path);
        
        addTab({
          fileId: node.id,
          filePath: node.path,
          fileName: node.name,
          languageId,
          content,
          isDirty: false,
          cursorPosition: { lineNumber: 1, column: 1 },
        });
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In a full implementation, show context menu here
    console.log('Context menu for:', node.path);
  };

  const icon = getNodeIcon(node);

  return (
    <div className="file-tree-node">
      <div
        className={`node-content ${isSelected ? 'selected' : ''} ${node.type === 'directory' ? 'directory' : 'file'}`}
        style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role="treeitem"
        aria-expanded={node.type === 'directory' ? isExpanded : undefined}
        aria-selected={isSelected}
      >
        <span className="node-icon">{icon}</span>
        <span className="node-name">{node.name}</span>
      </div>
      
      {node.type === 'directory' && isExpanded && node.children && (
        <div className="node-children" role="group">
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

function getNodeIcon(node: IFileNode): string {
  if (node.type === 'directory') {
    return '📁';
  }

  const ext = node.name.split('.').pop()?.toLowerCase() || '';
  
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
    scss: '🎨',
    html: '🌐',
    svg: '🖼️',
    png: '🖼️',
    jpg: '🖼️',
    gitignore: '🌿',
    env: '🔒',
  };

  return iconMap[ext] || '📄';
}

function getLanguageIdFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    json: 'json',
    md: 'markdown',
    css: 'css',
    scss: 'scss',
    html: 'html',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'shellscript',
    bash: 'shellscript',
    sql: 'sql',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    lua: 'lua',
    r: 'r',
    tf: 'terraform',
    dockerfile: 'dockerfile',
    makefile: 'makefile',
  };

  return languageMap[ext] || 'plaintext';
}

export default FileTreeNode;
