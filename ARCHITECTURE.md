# Iron IDE - Масштабируемая архитектура промышленного уровня

## 📊 Текущий статус

- **Строк кода**: ~2,500+ строк TypeScript/TSX
- **Модулей**: 12 файлов исходного кода
- **Типов**: 60+ интерфейсов для полной типизации IDE

## 🏗 Архитектурная схема

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            IRON IDE ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                         RENDERER PROCESS (React + Monaco)                 │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌───────────────────┐  │  │
│  │  │ File        │ │ Tab Bar      │ │ Monaco      │ │ Command Palette   │  │  │
│  │  │ Explorer    │ │ (Multi-tab)  │ │ Editor      │ │ (Fuzzy Search)    │  │  │
│  │  └─────────────┘ └──────────────┘ └─────────────┘ └───────────────────┘  │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌───────────────────┐  │  │
│  │  │ Git Panel   │ │ Terminal     │ │ Debug       │ │ Extensions View   │  │  │
│  │  │ (Changes)   │ │ (xterm.js)   │ │ Console     │ │ (Marketplace)     │  │  │
│  │  └─────────────┘ └──────────────┘ └─────────────┘ └───────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                    ↕ IPC Bridge                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                          MAIN PROCESS (Node.js)                           │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌───────────────────┐  │  │
│  │  │ FS Manager  │ │ LSP Manager  │ │ Terminal    │ │ Git Manager       │  │  │
│  │  │ (chokidar)  │ │ (pyright,    │ │ Manager     │ │ (simple-git)      │  │  │
│  │  │             │ │  tsserver)   │ │ (node-pty)  │ │                   │  │  │
│  │  └─────────────┘ └──────────────┘ └─────────────┘ └───────────────────┘  │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌───────────────────┐  │  │
│  │  │ Extension   │ │ Debug        │ │ Settings    │ │ Window Manager    │  │  │
│  │  │ Host        │ │ Adapter      │ │ Store       │ │ (Native UI)       │  │  │
│  │  │ (Isolated)  │ │ (DAP)        │ │ (JSON)      │ │                   │  │  │
│  │  └─────────────┘ └──────────────┘ └─────────────┘ └───────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                    ↕ Spawn                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                      EXTERNAL PROCESSES                                   │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌───────────────────┐  │  │
│  │  │ LSP Servers │ │ Debug        │ │ Terminal    │ │ Git CLI           │  │  │
│  │  │ (separate   │ │ Adapters     │ │ Shells      │ │ (git command)     │  │  │
│  │  │  processes) │ │ (lldb, gdb)  │ │ (bash, pwsh)│ │                   │  │  │
│  │  └─────────────┘ └──────────────┘ └─────────────┘ └───────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Структура проекта

```
/workspace
├── src/
│   ├── shared/
│   │   ├── types.ts          # 750+ строк - Полная система типов
│   │   └── utils.ts          # Утилиты и хелперы
│   │
│   ├── main/
│   │   ├── main.ts           # Точка входа Electron
│   │   ├── preload.ts        # Preload скрипт (IPC bridge)
│   │   ├── lsp-manager.ts    # 640+ строк - Управление LSP серверами
│   │   ├── terminal-manager.ts # 400+ строк - Управление терминалами
│   │   ├── fs-manager.ts     # Файловая система (watch, CRUD)
│   │   ├── git-manager.ts    # Git интеграция
│   │   ├── extension-host.ts # Изолированный хост плагинов
│   │   └── debug-adapter.ts  # Debug Adapter Protocol
│   │
│   └── renderer/
│       ├── App.tsx           # Главный компонент React
│       ├── index.tsx         # Точка входа React
│       ├── components/
│       │   ├── FileExplorer.tsx   # Дерево файлов
│       │   ├── TabBar.tsx         # Вкладки редактора
│       │   ├── EditorPane.tsx     # Контейнер Monaco
│       │   ├── TerminalPanel.tsx  # Интегрированный терминал
│       │   ├── CommandPalette.tsx # Поиск команд
│       │   ├── GitPanel.tsx       # Git изменения
│       │   ├── DebugPanel.tsx     # Отладчик
│       │   └── ExtensionsPanel.tsx # Плагины
│       ├── hooks/
│       │   ├── useEditor.ts    # Хук редактора
│       │   ├── useTerminal.ts  # Хук терминала
│       │   ├── useGit.ts       # Хук Git
│       │   └── useLsp.ts       # Хук LSP
│       └── services/
│           ├── ipc-service.ts  # IPC коммуникация
│           ├── lsp-client.ts   # LSP клиент
│           └── settings.ts     # Настройки
│
├── package.json              # Зависимости и скрипты
├── tsconfig.json             # Конфигурация TypeScript
├── webpack.*.config.js       # Webpack конфиги
└── README.md                 # Документация
```

## 🔧 Ключевые компоненты

### 1. Типы (types.ts - 750+ строк)

Полная система типов для всех подсистем IDE:

- **Core Types**: IFileTab, IFileSystemItem, IFileStats
- **LSP Types**: ILspConfig, ILspServer, ILspMessage
- **Terminal Types**: ITerminalInstance, ITerminalConfig, ITerminalTheme
- **Command Palette**: ICommand, IKeybinding, ICommandPaletteItem
- **Search**: ISearchQuery, ISearchResult, ISearchMatch, ISymbolInfo
- **Git**: IGitRepository, IGitStatus, IGitChange, IGitDiff, IGitCommit
- **Extension Host**: IExtension, IExtensionContributions, IConfigurationProperty
- **Debug (DAP)**: IDebugConfiguration, IDebugSession, IBreakpoint, IStackFrame
- **Editor Layout**: IEditorGroup, IEditorLayout, ISplitViewConfig
- **Settings**: ISettings, IEditorSettings, IFilesSettings, ITerminalSettings
- **UI State**: IUIState, IDiagnostic, IOutputChannel, INotification

### 2. LSP Manager (lsp-manager.ts - 640+ строк)

Полноценный менеджер языковых серверов:

```typescript
class LspManager extends EventEmitter {
  // Запуск сервера (pyright, tsserver, gopls, rust-analyzer...)
  async startServer(serverId: string, config: ILspConfig): Promise<void>
  
  // Остановка сервера
  async stopServer(serverId: string): Promise<void>
  
  // LSP запросы
  async sendRequest<T>(serverId: string, method: string, params: any): Promise<T>
  async sendNotification(serverId: string, method: string, params: any): Promise<void>
  
  // Документы
  async openDocument(serverId: string, uri: string, languageId: string, version: number, text: string)
  async changeDocument(serverId: string, uri: string, version: number, changes: any[])
  async closeDocument(serverId: string, uri: string)
  async saveDocument(serverId: string, uri: string, text?: string)
  
  // Интеллисенс
  async getCompletion(serverId: string, uri: string, position: Position)
  async getHover(serverId: string, uri: string, position: Position)
  async getDefinition(serverId: string, uri: string, position: Position)
  async getReferences(serverId: string, uri: string, position: Position)
  async rename(serverId: string, uri: string, position: Position, newName: string)
  async formatDocument(serverId: string, uri: string, options: FormatOptions)
}
```

**Поддерживаемые LSP серверы:**
- TypeScript: `tsserver` (встроен в vscode-languageserver)
- Python: `pyright` или `pylsp`
- Go: `gopls`
- Rust: `rust-analyzer`
- C/C++: `clangd`
- Java: `jdtls`
- PHP: `intelephense`
- И многие другие...

### 3. Terminal Manager (terminal-manager.ts - 400+ строк)

Интегрированный терминал на базе node-pty:

```typescript
class TerminalManager extends EventEmitter {
  // Создание терминала
  createTerminal(id: string, options: Partial<ITerminalConfig>): ITerminalInstance
  
  // Управление
  destroyTerminal(id: string)
  sendInput(id: string, data: string)
  resize(id: string, cols: number, rows: number)
  clear(id: string)
  
  // Буфер и скролл
  getBuffer(id: string, startLine?: number, endLine?: number): ITerminalBufferLine[]
  scrollTo(id: string, line: number)
  scrollUp(id: string, pages: number)
  scrollDown(id: string, pages: number)
  
  // Поиск и экспорт
  searchInBuffer(id: string, query: string, caseSensitive?: boolean)
  exportHistory(id: string): string
  
  // Разделение
  splitTerminal(id: string, newId: string): ITerminalInstance
}
```

**Фичи:**
- Поддержка bash, zsh, fish, PowerShell
- PTY (pseudo-terminal) для полноценной эмуляции
- Буфер на 1000+ строк с авто-скроллом
- Поиск по истории
- Экспорт истории
- Split terminals (разделение экрана)

### 4. Расширения до 15,000+ строк

Для достижения полного функционала VS Code необходимо добавить:

#### A. File System Manager (~300 строк)
```typescript
// src/main/fs-manager.ts
- chokidar watch для отслеживания изменений
- Рекурсивное чтение директорий
- CRUD операции с файлами
- Drag & Drop поддержка
- Контекстное меню (New File, New Folder, Delete, Rename)
```

#### B. Git Manager (~500 строк)
```typescript
// src/main/git-manager.ts
- simple-git для Git операций
- Статус репозитория (staged, unstaged, untracked)
- Diff между версиями
- Commit, Push, Pull, Fetch
- Branch management
- Merge conflict resolution
```

#### C. Extension Host (~800 строк)
```typescript
// src/main/extension-host.ts
- Изолированный Node.js процесс для плагинов
- API совместимый с VS Code Extension API
- Activation events (onLanguage, onCommand, onStartupFinished)
- Contribution points (commands, languages, grammars, themes)
- Marketplace integration
```

#### D. Debug Adapter (~600 строк)
```typescript
// src/main/debug-adapter.ts
- Debug Adapter Protocol (DAP) клиент
- Запуск отладчиков (lldb, gdb, node-debug2)
- Breakpoints, watch expressions, call stack
- Variables inspection
- Step over/into/out, continue
```

#### E. Command Palette (~400 строк)
```typescript
// src/renderer/components/CommandPalette.tsx
- Fuzzy search по командам
- Категоризация команд
- Keybindings отображение
- Recently used commands
- Quick picks для ввода
```

#### F. Search Panel (~500 строк)
```typescript
// src/renderer/components/SearchPanel.tsx
- Поиск по файлам (grep-like)
- Регулярные выражения
- Include/Exclude паттерны
- Preview matches с контекстом
- Replace in files
```

#### G. Settings UI (~400 строк)
```typescript
// src/renderer/components/SettingsEditor.tsx
- JSON редактор настроек
- GUI редактор с категориями
- Default vs User vs Workspace settings
- Sync settings между устройствами
```

#### H. Status Bar (~200 строк)
```typescript
// src/renderer/components/StatusBar.tsx
- Current language
- Cursor position (line:col)
- Git branch
- LSP server status
- Notifications badge
- Zoom level
```

#### I. Activity Bar (~300 строк)
```typescript
// src/renderer/components/ActivityBar.tsx
- Переключение между панелями
- Icons для Explorer, Search, Git, Debug, Extensions
- Badges для уведомлений
- Context menu
```

#### J. Editor Services (~600 строк)
```typescript
// src/renderer/services/editor-service.ts
- Multiple editor groups (split view)
- Synchronized scrolling
- Compare editor (diff view)
- Minimap
- Breadcrumbs navigation
- Word wrap toggle
- Zen mode
```

## 📦 Необходимые npm пакеты

### Уже установлены:
```json
{
  "dependencies": {
    "chokidar": "^5.0.0",           // File watching
    "monaco-editor": "^0.55.1",     // Editor core
    "react": "^19.2.5",             // UI framework
    "react-dom": "^19.2.5",
    "vscode-languageserver": "^9.0.1",
    "vscode-languageserver-protocol": "^3.17.5",
    "vscode-languageserver-textdocument": "^1.0.12"
  },
  "devDependencies": {
    "@types/node": "^25.6.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "typescript": "^6.0.2",
    "webpack": "^5.106.1",
    "electron": "latest"            // Нужно добавить
  }
}
```

### Необходимо добавить:
```bash
npm install electron --save-dev
npm install node-pty                # Терминал
npm install simple-git              # Git операции
npm install @xterm/xterm            # XTerm.js для рендеринга терминала
npm install @xterm/addon-fit        # Auto-resize для xterm
npm install @xterm/addon-webgl      # WebGL рендерер для производительности
npm install fuzzysort                 # Fuzzy search для Command Palette
npm install keytar                  # Безопасное хранение паролей (для Git)
npm install ws                      # WebSocket для remote development
npm install tar                     # Работа с архивами (для extensions)
npm install semver                  # Semantic versioning
npm install axios                   # HTTP клиент для marketplace
npm install uuid                    # Генерация уникальных ID
npm install lodash                  # Утилиты
```

## 🚀 Roadmap до 15,000 строк

| Компонент | Строк | Статус | Приоритет |
|-----------|-------|--------|-----------|
| Core Types | 750 | ✅ Готово | P0 |
| LSP Manager | 640 | ✅ Готово | P0 |
| Terminal Manager | 400 | ✅ Готово | P0 |
| Main Process | 140 | ✅ Базово | P0 |
| Renderer App | 220 | ✅ Базово | P0 |
| File Explorer | 100 | ⚠️ Частично | P1 |
| Tab Bar | 50 | ⚠️ Частично | P1 |
| **FS Manager** | 300 | ❌ TODO | P1 |
| **Git Manager** | 500 | ❌ TODO | P1 |
| **Extension Host** | 800 | ❌ TODO | P2 |
| **Debug Adapter** | 600 | ❌ TODO | P2 |
| **Command Palette** | 400 | ❌ TODO | P1 |
| **Search Panel** | 500 | ❌ TODO | P1 |
| **Settings UI** | 400 | ❌ TODO | P2 |
| **Status Bar** | 200 | ❌ TODO | P1 |
| **Activity Bar** | 300 | ❌ TODO | P1 |
| **Editor Services** | 600 | ❌ TODO | P1 |
| **Terminal Component** | 350 | ❌ TODO | P1 |
| **Git Panel** | 400 | ❌ TODO | P2 |
| **Debug Panel** | 450 | ❌ TODO | P2 |
| **Extensions Panel** | 500 | ❌ TODO | P3 |
| **Problems Panel** | 250 | ❌ TODO | P1 |
| **Output Panel** | 200 | ❌ TODO | P2 |
| **Notifications** | 250 | ❌ TODO | P2 |
| **Keybindings** | 300 | ❌ TODO | P2 |
| **Themes** | 400 | ❌ TODO | P3 |
| **Snippets** | 200 | ❌ TODO | P3 |
| **Workspace** | 350 | ❌ TODO | P2 |
| **IPC Service** | 300 | ❌ TODO | P0 |
| **LSP Client** | 400 | ❌ TODO | P0 |
| **Utils & Helpers** | 500 | ❌ TODO | P1 |
| **Tests** | 1000 | ❌ TODO | P3 |
| **Documentation** | 500 | ❌ TODO | P3 |
| **TOTAL** | **~15,000** | | |

## 🎯 Следующие шаги

1. **Установить недостающие зависимости**:
   ```bash
   npm install electron node-pty simple-git @xterm/xterm @xterm/addon-fit fuzzysort --save
   ```

2. **Реализовать IPC Service** для связи Renderer ↔ Main

3. **Добавить FS Manager** с полным CRUD и watch

4. **Создать Git Manager** для работы с репозиториями

5. **Реализовать Command Palette** с fuzzy search

6. **Добавить Terminal Component** на базе xterm.js

7. **Создать Extension Host** для изоляции плагинов

8. **Реализовать Debug Adapter** для отладки

Этот скелет готов к масштабированию. Каждый компонент спроектирован так, чтобы его можно было развивать независимо, сохраняя общую архитектуру.
