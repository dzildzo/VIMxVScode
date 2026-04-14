// Shared Types for Iron IDE
// Hardcore type definitions for maximum safety

export interface IFileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: IFileNode[];
  isOpen?: boolean;
  depth: number;
}

export interface IEditorTab {
  id: string;
  fileId: string;
  filePath: string;
  fileName: string;
  languageId: string;
  content: string;
  isDirty: boolean;
  isActive: boolean;
  cursorPosition?: ICursorPosition;
}

export interface ICursorPosition {
  lineNumber: number;
  column: number;
}

export interface ILspConfig {
  command: string;
  args: string[];
  fileExtensions: string[];
  languageId: string;
}

export interface ILspMessage {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
  id?: number | string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface IDiagnostic {
  range: IRange;
  severity: DiagnosticSeverity;
  code?: string | number;
  source?: string;
  message: string;
}

export enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}

export interface IRange {
  start: IPosition;
  end: IPosition;
}

export interface IPosition {
  line: number;
  character: number;
}

export interface ICompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
  range?: IRange;
}

export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18,
  Folder = 19,
  EnumMember = 20,
  Constant = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25,
}

export interface IHover {
  contents: IMarkupContent | IMarkedString[];
  range?: IRange;
}

export interface IMarkupContent {
  kind: 'plaintext' | 'markdown';
  value: string;
}

export type IMarkedString = string | { language: string; value: string };

export interface IWorkspaceFolder {
  uri: string;
  name: string;
  path: string;
}

export interface ISettings {
  editor: IEditorSettings;
  files: IFilesSettings;
  lsp: ILspSettings;
  theme: IThemeSettings;
}

export interface IEditorSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  insertSpaces: boolean;
  minimap: boolean;
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  autoSave: 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';
  autoSaveDelay: number;
}

export interface IFilesSettings {
  exclude: string[];
  watchExclude: string[];
  maxFileSize: number;
}

export interface ILspSettings {
  enabled: boolean;
  servers: Record<string, ILspServerConfig>;
}

export interface ILspServerConfig {
  command: string;
  args: string[];
  enabled: boolean;
}

export interface IThemeSettings {
  theme: 'light' | 'dark' | 'hc-black';
  colorOverrides?: Partial<IColorOverrides>;
}

export interface IColorOverrides {
  'editor.background': string;
  'editor.foreground': string;
  'sideBar.background': string;
  'activityBar.background': string;
  'statusBar.background': string;
}

export interface IIpcRequest {
  channel: string;
  type: 'request' | 'response' | 'notification';
  id?: string;
  payload: unknown;
}

export interface IIpcResponse {
  id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export type FileSystemEvent = 
  | { type: 'add'; path: string }
  | { type: 'change'; path: string }
  | { type: 'unlink'; path: string }
  | { type: 'addDir'; path: string }
  | { type: 'unlinkDir'; path: string };

export interface IExtensionManifest {
  name: string;
  version: string;
  description: string;
  main: string;
  contributes?: {
    commands?: ICommandContribution[];
    languages?: ILanguageContribution[];
  };
}

export interface ICommandContribution {
  command: string;
  title: string;
  category?: string;
}

export interface ILanguageContribution {
  id: string;
  aliases: string[];
  extensions: string[];
  configuration?: string;
}
