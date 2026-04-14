import * as monaco from 'monaco-editor';

export function getLanguageIdFromExtension(extension: string): string {
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'go': 'go',
    'rs': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'java': 'java',
    'cs': 'csharp',
    'rb': 'ruby',
    'php': 'php',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell',
  };
  
  return languageMap[extension.toLowerCase()] || 'plaintext';
}

export function createModelForFile(path: string, content: string): monaco.editor.ITextModel {
  const extension = path.split('.').pop() || '';
  const languageId = getLanguageIdFromExtension(extension);
  
  const uri = monaco.Uri.file(path);
  let model = monaco.editor.getModel(uri);
  
  if (model) {
    model.setValue(content);
    return model;
  }
  
  model = monaco.editor.createModel(content, languageId, uri);
  return model;
}
