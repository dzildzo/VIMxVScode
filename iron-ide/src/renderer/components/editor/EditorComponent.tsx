import React, { useEffect, useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { useEditorStore } from '../../store/editor-store';
import { useFileStore } from '../../store/file-store';

// Monaco editor requires special handling in webpack
// We'll load it dynamically to avoid bundling issues
const EditorComponent: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  
  const { tabs, activeTabId, updateTabContent, updateTabDirty, setEditorInstance } = useEditorStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Initialize Monaco Editor
  useEffect(() => {
    if (!editorRef.current) return;

    const initEditor = async () => {
      try {
        // Dynamic import of Monaco Editor
        const monacoModule = await import('monaco-editor');
        monacoRef.current = monacoModule.default || monacoModule;
        
        const editor = monacoModule.editor.create(editorRef.current!, {
          value: '',
          language: 'plaintext',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'off',
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          formatOnPaste: true,
          formatOnType: true,
          autoIndent: 'full',
          folding: true,
          foldingStrategy: 'indentation',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentationLines: true,
          },
        });

        editorInstance.current = editor;
        setEditorInstance(editor);

        // Handle content changes
        editor.onDidChangeModelContent(() => {
          if (activeTabId) {
            const value = editor.getValue();
            updateTabContent(activeTabId, value);
            updateTabDirty(activeTabId, true);
          }
        });

        // Handle cursor position changes
        editor.onDidChangeCursorPosition((e) => {
          if (activeTabId) {
            // Update cursor position in store if needed
          }
        });

        // Load initial content if tab is active
        if (activeTab) {
          const model = editor.getModel();
          if (model) {
            monacoModule.editor.setModelLanguage(model, activeTab.languageId);
            editor.setValue(activeTab.content);
          }
        }

        // Setup keyboard shortcuts
        editor.addCommand(
          monacoModule.KeyMod.CtrlCmd | monacoModule.KeyCode.KeyS,
          () => {
            // Save file
            console.log('Save triggered');
          }
        );

      } catch (error) {
        console.error('Error initializing Monaco Editor:', error);
      }
    };

    initEditor();

    return () => {
      if (editorInstance.current) {
        editorInstance.current.dispose();
        editorInstance.current = null;
      }
    };
  }, []);

  // Update editor when active tab changes
  useEffect(() => {
    if (!editorInstance.current || !activeTab || !monacoRef.current) return;

    const editor = editorInstance.current;
    const monaco = monacoRef.current;

    let model = editor.getModel();
    
    if (!model || model.uri.path !== `/${activeTab.filePath}`) {
      // Create or reuse model for this file
      const existingModel = monaco.editor.getModel(monaco.Uri.parse(`file:///${activeTab.filePath}`));
      
      if (existingModel) {
        editor.setModel(existingModel);
        model = existingModel;
      } else {
        model = monaco.editor.createModel(
          activeTab.content,
          activeTab.languageId,
          monaco.Uri.parse(`file:///${activeTab.filePath}`)
        );
        editor.setModel(model);
      }
    } else {
      // Just update the content if it's different
      if (model.getValue() !== activeTab.content) {
        model.setValue(activeTab.content);
      }
    }

    // Set language
    monaco.editor.setModelLanguage(model, activeTab.languageId);

  }, [activeTabId, activeTab]);

  // Update editor settings when they change
  useEffect(() => {
    if (!editorInstance.current) return;
    
    // Could listen to settings changes here and update editor options
  }, []);

  return (
    <div className="editor-container">
      <div ref={editorRef} className="monaco-editor-root" />
      {!activeTab && (
        <div className="editor-welcome">
          <h2>Iron IDE</h2>
          <p>Select a file from the explorer to start editing</p>
          <div className="welcome-actions">
            <div className="action-item">
              <span className="shortcut">⌘+O</span>
              <span>Open File</span>
            </div>
            <div className="action-item">
              <span className="shortcut">⌘+Shift+P</span>
              <span>Command Palette</span>
            </div>
            <div className="action-item">
              <span className="shortcut">⌘+`</span>
              <span>Toggle Terminal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorComponent;
