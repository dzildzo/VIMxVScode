// ============================================================================
// CORE TYPES - Базовые типы для всей IDE
// ============================================================================

export interface IFileTab {
  id: string;
  path: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
  languageId: string;
  encoding?: string;
  lineEnding?: 'LF' | 'CRLF';
}

export interface IFileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  children?: IFileSystemItem[];
  isExpanded?: boolean;
  depth?: number;
  stats?: IFileStats;
}

export interface IFileStats {
  size: number;
  mtime: Date;
  ctime: Date;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
}

// ============================================================================
// LSP TYPES - Language Server Protocol
// ============================================================================

export interface ILspConfig {
  command: string;
  args: string[];
  fileExtensions: string[];
  languageId: string;
  rootUri?: string;
  initializationOptions?: Record<string, any>;
}

export interface ILspServer {
  id: string;
  config: ILspConfig;
  status: 'starting' | 'running' | 'stopped' | 'error';
  error?: string;
}

export interface ILspMessage {
  jsonrpc: '2.0';
  id?: number | string;
  method?: string;
  params?: any;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

// ============================================================================
// TERMINAL TYPES - Интегрированный терминал
// ============================================================================

export interface ITerminalInstance {
  id: string;
  name: string;
  cwd: string;
  shell: string;
  pid?: number;
  isRunning: boolean;
  buffer: ITerminalBufferLine[];
  scrollTop: number;
}

export interface ITerminalBufferLine {
  content: string;
  isWrapped?: boolean;
  timestamp: number;
}

export interface ITerminalConfig {
  shell: string;
  cwd: string;
  env: Record<string, string>;
  fontSize: number;
  fontFamily: string;
  theme: ITerminalTheme;
}

export interface ITerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  colors: {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    brightBlack: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
  };
}

// ============================================================================
// COMMAND PALETTE TYPES - Поиск команд
// ============================================================================

export interface ICommand {
  id: string;
  label: string;
  description?: string;
  category?: string;
  keybindings?: IKeybinding[];
  when?: string; // Condition expression
  handler: () => void | Promise<void>;
}

export interface IKeybinding {
  primary: number; // KeyCode
  mac?: number;
  win?: number;
  linux?: number;
}

export interface ICommandPaletteItem {
  command: ICommand;
  score: number; // For fuzzy search
}

// ============================================================================
// SEARCH TYPES - Поиск по проекту
// ============================================================================

export interface ISearchQuery {
  pattern: string;
  include?: string[];
  exclude?: string[];
  useRegex?: boolean;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  maxResults?: number;
}

export interface ISearchResult {
  filePath: string;
  matches: ISearchMatch[];
  preview?: string;
}

export interface ISearchMatch {
  line: number;
  column: number;
  text: string;
  beforeContext?: string[];
  afterContext?: string[];
}

export interface ISymbolInfo {
  name: string;
  kind: 'function' | 'class' | 'method' | 'variable' | 'constant' | 'interface' | 'type' | 'module';
  range: IRange;
  containerName?: string;
  detail?: string;
}

export interface IRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

// ============================================================================
// GIT TYPES - Git интеграция
// ============================================================================

export interface IGitRepository {
  rootPath: string;
  head?: IGitHead;
  remotes: IGitRemote[];
  branches: IGitBranch[];
  status: IGitStatus;
}

export interface IGitHead {
  name?: string;
  commit?: string;
  detached?: boolean;
}

export interface IGitRemote {
  name: string;
  url: string;
  fetchUrl?: string;
  pushUrl?: string;
}

export interface IGitBranch {
  name: string;
  remote?: string;
  current: boolean;
  ahead?: number;
  behind?: number;
}

export interface IGitStatus {
  staged: IGitChange[];
  unstaged: IGitChange[];
  untracked: string[];
  mergeChanges?: IGitChange[];
}

export interface IGitChange {
  path: string;
  originalPath?: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | 'unmerged';
  diff?: IGitDiff;
}

export interface IGitDiff {
  hunks: IGitHunk[];
  stats: { additions: number; deletions: number; changes: number };
}

export interface IGitHunk {
  header: string;
  lines: IGitDiffLine[];
  fromLine: number;
  toLine: number;
  fromLines: number;
  toLines: number;
}

export interface IGitDiffLine {
  type: 'context' | 'add' | 'delete';
  text: string;
  lineNumber?: number;
}

export interface IGitCommit {
  hash: string;
  shortHash: string;
  subject: string;
  body?: string;
  author: IGitAuthor;
  date: Date;
  parents: string[];
}

export interface IGitAuthor {
  name: string;
  email: string;
}

// ============================================================================
// EXTENSION HOST TYPES - Система плагинов
// ============================================================================

export interface IExtension {
  id: string;
  name: string;
  version: string;
  publisher: string;
  description?: string;
  main?: string;
  activationEvents: string[];
  contributes?: IExtensionContributions;
  enabled: boolean;
  path: string;
}

export interface IExtensionContributions {
  commands?: IExtensionCommand[];
  languages?: ILanguageContribution[];
  grammars?: IGrammarContribution[];
  themes?: IThemeContribution[];
  snippets?: ISnippetContribution[];
  configuration?: IConfigurationContribution;
}

export interface IExtensionCommand {
  command: string;
  title: string;
  category?: string;
  icon?: string;
}

export interface ILanguageContribution {
  id: string;
  aliases?: string[];
  extensions?: string[];
  filenames?: string[];
  firstLine?: string;
  configuration?: string;
}

export interface IGrammarContribution {
  language: string;
  scopeName: string;
  path: string;
}

export interface IThemeContribution {
  label: string;
  uiTheme?: 'vs' | 'vs-dark' | 'hc-black';
  path: string;
}

export interface ISnippetContribution {
  language: string;
  path: string;
}

export interface IConfigurationContribution {
  title: string;
  properties: Record<string, IConfigurationProperty>;
}

export interface IConfigurationProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  default?: any;
  description?: string;
  enum?: any[];
  scope?: 'application' | 'machine' | 'window' | 'resource';
}

export interface IExtensionHostMessage {
  type: 'EXTENSION_ACTIVATED' | 'EXTENSION_ERROR' | 'API_CALL' | 'EVENT';
  extensionId?: string;
  payload: any;
}

// ============================================================================
// DEBUG ADAPTER PROTOCOL (DAP) TYPES - Отладчик
// ============================================================================

export interface IDebugConfiguration {
  type: string;
  request: 'launch' | 'attach';
  name: string;
  program?: string;
  cwd?: string;
  args?: string[];
  env?: Record<string, string>;
  stopOnEntry?: boolean;
  preLaunchTask?: string;
  internalConsoleOptions?: 'neverOpen' | 'openOnSessionStart' | 'openOnFirstSessionStart';
}

export interface IDebugSession {
  id: string;
  configuration: IDebugConfiguration;
  state: 'initializing' | 'running' | 'stopped' | 'terminated';
  threads: IDebugThread[];
  breakpoints: IBreakpoint[];
}

export interface IDebugThread {
  id: number;
  name: string;
  stackFrames: IStackFrame[];
}

export interface IStackFrame {
  id: number;
  name: string;
  source?: ISource;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  canRestart?: boolean;
}

export interface ISource {
  name?: string;
  path?: string;
  sourceReference?: number;
  presentationHint?: 'normal' | 'emphasize' | 'deemphasize' | 'subtle';
}

export interface IBreakpoint {
  id?: number;
  source: ISource;
  line: number;
  column?: number;
  condition?: string;
  hitCondition?: string;
  logMessage?: string;
  verified: boolean;
  message?: string;
}

export interface IDebugVariable {
  name: string;
  value: string;
  type?: string;
  variablesReference: number;
  indexedVariables?: number;
  namedVariables?: number;
  evaluateName?: string;
  presentationHint?: IVariablePresentationHint;
}

export interface IVariablePresentationHint {
  kind?: 'property' | 'method' | 'class' | 'data' | 'event' | 'baseClass' | 'innerClass';
  visibility?: 'public' | 'private' | 'protected' | 'internal' | 'final';
  attributes?: ('readOnly' | 'hasSideEffects' | 'canHaveFaultyState')[];
}

// ============================================================================
// EDITOR LAYOUT TYPES - Разделенный редактор
// ============================================================================

export interface IEditorGroup {
  id: string;
  tabs: IFileTab[];
  activeTabId: string | null;
  viewColumn: number;
  size?: number; // Percentage or pixels
}

export interface IEditorLayout {
  orientation: 'horizontal' | 'vertical';
  groups: (IEditorGroup | IEditorLayout)[];
  activeGroupId: string;
}

export interface ISplitViewConfig {
  splitDirection: 'right' | 'down' | 'left' | 'up';
  preserveFocus?: boolean;
}

// ============================================================================
// SETTINGS & CONFIGURATION TYPES
// ============================================================================

export interface ISettings {
  editor: IEditorSettings;
  files: IFilesSettings;
  terminal: ITerminalSettings;
  git: IGitSettings;
  debug: IDebugSettings;
  extensions: IExtensionsSettings;
  workbench: IWorkbenchSettings;
}

export interface IEditorSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  minimap: { enabled: boolean; side: 'left' | 'right' };
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  tabSize: number;
  insertSpaces: boolean;
  formatOnSave: boolean;
  formatOnPaste: boolean;
  autoClosingBrackets: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  autoClosingQuotes: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  suggestOnTriggerCharacters: boolean;
  quickSuggestions: boolean | 'other' | 'comments' | 'strings';
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
  rulers: number[];
  folding: boolean;
  foldingStrategy: 'auto' | 'indentation';
  bracketPairColorization: { enabled: boolean; independentColorPoolPerBracketType: boolean };
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  cursorStyle: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
  smoothScrolling: boolean;
  scrollBeyondLastLine: boolean;
}

export interface IFilesSettings {
  autoSave: 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';
  autoSaveDelay: number;
  encoding: string;
  eol: 'lf' | 'crlf' | 'auto';
  trimTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
  trimFinalNewlines: boolean;
  exclude: Record<string, boolean>;
  watchersExclude: Record<string, boolean>;
  maxMemoryForLargeFilesMB: number;
}

export interface ITerminalSettings {
  integrated: {
    cwd: string;
    shell: {
      linux: string;
      mac: string;
      windows: string;
    };
    args: string[];
    env: Record<string, string>;
    fontSize: number;
    fontFamily: string;
    cursorBlinking: boolean;
    cursorStyle: 'block' | 'underline' | 'line';
    scrollback: number;
    drawBoldTextInBrightColors: boolean;
    minimumContrastRatio: number;
    fastScrollSensitivity: number;
    mouseWheelScrollSensitivity: number;
  };
}

export interface IGitSettings {
  enabled: boolean;
  path: string;
  autoRefresh: boolean;
  autoStash: boolean;
  confirmSync: boolean;
  confirmDelete: boolean;
  openDiffOnClick: boolean;
  enableSmartCommit: boolean;
  enableCommitSigning: boolean;
  decorations: {
    enabled: boolean;
    colors: {
      added: string;
      modified: string;
      deleted: string;
      renamed: string;
      untracked: string;
      ignored: string;
      conflicting: string;
    };
  };
}

export interface IDebugSettings {
  allowBreakpointsEverywhere: boolean;
  openExplorerOnEnd: boolean;
  showHover: boolean;
  consoleMode: 'internal' | 'external' | 'integrated';
  suppressMultipleSessionWarning: boolean;
}

export interface IExtensionsSettings {
  autoUpdate: boolean;
  ignoreRecommendations: boolean;
  showRecommendationsOnlyOnDemand: boolean;
  marketplaceEnabled: boolean;
}

export interface IWorkbenchSettings {
  colorTheme: string;
  iconTheme: string;
  activityBar: { visible: boolean; location: 'left' | 'right' };
  sideBar: { visible: boolean; location: 'left' | 'right' };
  statusBar: { visible: boolean };
  breadcrumbs: { enabled: boolean };
  zoomLevel: number;
  titleBar: 'native' | 'custom';
  window: {
    menuBarVisibility: 'classic' | 'visible' | 'toggle' | 'hidden' | 'compact';
    newWindowDimensions: 'default' | 'inherit' | 'maximized' | 'fullscreen';
  };
}

// ============================================================================
// IPC MESSAGE TYPES - Межпроцессное взаимодействие
// ============================================================================

export interface IMessageFromMain {
  type: 
    | 'FILE_CONTENT'
    | 'FILE_SAVED'
    | 'FILE_TREE'
    | 'FILE_CHANGED'
    | 'LSP_MESSAGE'
    | 'TERMINAL_OUTPUT'
    | 'TERMINAL_EXIT'
    | 'GIT_STATUS'
    | 'GIT_UPDATE'
    | 'DEBUG_EVENT'
    | 'EXTENSION_MESSAGE'
    | 'SETTINGS_UPDATED';
  payload: any;
  requestId?: string;
}

export interface IMessageFromRenderer {
  type:
    | 'OPEN_FILE'
    | 'SAVE_FILE'
    | 'GET_FILE_TREE'
    | 'WATCH_FILE'
    | 'UNWATCH_FILE'
    | 'LSP_REQUEST'
    | 'LSP_NOTIFY'
    | 'TERMINAL_INPUT'
    | 'TERMINAL_CREATE'
    | 'TERMINAL_DESTROY'
    | 'TERMINAL_RESIZE'
    | 'GIT_COMMAND'
    | 'GIT_INIT'
    | 'DEBUG_REQUEST'
    | 'DEBUG_RESPONSE'
    | 'EXTENSION_HOST_CALL'
    | 'GET_SETTINGS'
    | 'UPDATE_SETTINGS'
    | 'SHOW_MESSAGE'
    | 'REGISTER_COMMAND';
  payload: any;
  requestId?: string;
}

// ============================================================================
// WORKSPACE TYPES
// ============================================================================

export interface IWorkspace {
  id: string;
  name: string;
  folders: IWorkspaceFolder[];
  settings?: Partial<ISettings>;
}

export interface IWorkspaceFolder {
  uri: string;
  name: string;
  index: number;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface IUIState {
  sidebar: {
    visible: boolean;
    activeView: 'explorer' | 'search' | 'git' | 'debug' | 'extensions';
    width: number;
  };
  panel: {
    visible: boolean;
    activeView: 'terminal' | 'output' | 'problems' | 'debug-console';
    height: number;
  };
  auxiliaryBar: {
    visible: boolean;
    location: 'left' | 'right';
  };
  zenMode: boolean;
  centeredLayout: boolean;
}

// ============================================================================
// DIAGNOSTICS TYPES
// ============================================================================

export interface IDiagnostic {
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  source?: string;
  code?: string | number;
  range: IRange;
  relatedInformation?: IDiagnosticRelatedInformation[];
  tags?: ('unnecessary' | 'deprecated')[];
  data?: any;
}

export interface IDiagnosticRelatedInformation {
  location: { uri: string; range: IRange };
  message: string;
}

export interface IProblemsPanelItem {
  uri: string;
  diagnostics: IDiagnostic[];
}

// ============================================================================
// OUTPUT CHANNEL TYPES
// ============================================================================

export interface IOutputChannel {
  name: string;
  id: string;
  entries: IOutputEntry[];
}

export interface IOutputEntry {
  timestamp: Date;
  content: string;
  type: 'info' | 'error' | 'warning' | 'debug';
}

// ============================================================================
// KEYBOARD SHORTCUTS TYPES
// ============================================================================

export interface IKeybindingProfile {
  id: string;
  name: string;
  keybindings: IKeybindingOverride[];
}

export interface IKeybindingOverride {
  commandId: string;
  keybinding: string;
  when?: string;
}

// ============================================================================
// CLIPBOARD TYPES
// ============================================================================

export interface IClipboardData {
  text?: string;
  html?: string;
  rtfs?: string;
  image?: Buffer;
}

// ============================================================================
// DRAG AND DROP TYPES
// ============================================================================

export interface IDragData {
  type: 'file' | 'tab' | 'text' | 'extension';
  data: any;
  effectAllowed: 'copy' | 'move' | 'copyMove' | 'link' | 'copyLink';
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface INotification {
  id: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  actions?: INotificationAction[];
  source?: string;
  timestamp: Date;
  expires?: number;
}

export interface INotificationAction {
  label: string;
  handler: () => void;
}

// ============================================================================
// PROGRESS TYPES
// ============================================================================

export interface IProgressTask {
  id: string;
  title: string;
  message?: string;
  progress: number; // 0-100
  total?: number;
  cancellable: boolean;
  location: 'notification' | 'statusbar' | 'view';
}

// ============================================================================
// TELEMETRY TYPES (для будущей аналитики)
// ============================================================================

export interface ITelemetryEvent {
  eventName: string;
  properties?: Record<string, any>;
  measurements?: Record<string, number>;
  timestamp: Date;
}

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

export function isFileSystemItem(item: any): item is IFileSystemItem {
  return item && typeof item === 'object' && 'name' in item && 'path' in item && 'type' in item;
}

export function isFileTab(tab: any): tab is IFileTab {
  return tab && typeof tab === 'object' && 'id' in tab && 'path' in tab && 'content' in tab;
}

export function isGitChange(change: any): change is IGitChange {
  return change && typeof change === 'object' && 'path' in change && 'status' in change;
}

export function isDebugSession(session: any): session is IDebugSession {
  return session && typeof session === 'object' && 'id' in session && 'configuration' in session;
}

export function isExtension(ext: any): ext is IExtension {
  return ext && typeof ext === 'object' && 'id' in ext && 'name' in ext && 'version' in ext;
}
