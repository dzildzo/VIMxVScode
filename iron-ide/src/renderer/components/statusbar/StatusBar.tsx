import React from 'react';
import { useEditorStore } from '../../store/editor-store';

const StatusBar: React.FC = () => {
  const { activeTabId, tabs, editorInstance } = useEditorStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  const getCursorPosition = () => {
    if (!editorInstance) return 'Ln 1, Col 1';
    
    const position = editorInstance.getPosition();
    if (!position) return 'Ln 1, Col 1';
    
    return `Ln ${position.lineNumber}, Col ${position.column}`;
  };

  const getSelectionInfo = () => {
    if (!editorInstance) return '';
    
    const selection = editorInstance.getSelection();
    if (!selection || selection.isEmpty()) return '';
    
    const lines = Math.abs(selection.endLineNumber - selection.startLineNumber) + 1;
    const chars = Math.abs(selection.getEndPosition().column - selection.getPosition().column) + 1;
    
    return `(${lines}x${chars})`;
  };

  const getLanguageName = (languageId: string) => {
    const names: Record<string, string> = {
      typescript: 'TypeScript',
      javascript: 'JavaScript',
      python: 'Python',
      go: 'Go',
      rust: 'Rust',
      json: 'JSON',
      markdown: 'Markdown',
      css: 'CSS',
      html: 'HTML',
      yaml: 'YAML',
      xml: 'XML',
      sql: 'SQL',
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      php: 'PHP',
      ruby: 'Ruby',
      swift: 'Swift',
      kotlin: 'Kotlin',
      shellscript: 'Shell',
      plaintext: 'Plain Text',
    };
    
    return names[languageId] || languageId;
  };

  const getEncodingInfo = () => 'UTF-8';
  const getLineEndingInfo = () => 'LF';

  return (
    <footer className="status-bar">
      <div className="status-bar-left">
        <div className="status-item" title="Source Control">
          🌿 main
        </div>
        <div className="status-item" title="Problems">
          ⚠️ 0 🔴 0
        </div>
      </div>

      <div className="status-bar-right">
        {activeTab && (
          <>
            <div className="status-item" title="Cursor Position">
              {getCursorPosition()} {getSelectionInfo()}
            </div>
            <div className="status-item" title="Spaces for Tab">
              Spaces: 2
            </div>
            <div className="status-item" title="Encoding">
              {getEncodingInfo()}
            </div>
            <div className="status-item" title="Line Ending">
              {getLineEndingInfo()}
            </div>
            <div className="status-item language" title="Language">
              {getLanguageName(activeTab.languageId)}
            </div>
          </>
        )}
        
        {!activeTab && (
          <div className="status-item">No file open</div>
        )}
        
        <div className="status-item" title="Prettier">
          ✓ Prettier
        </div>
        
        <div className="status-item bell" title="Notifications">
          🔔
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
