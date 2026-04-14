# 🔩 Iron IDE

**Hardcore Lightweight IDE** built on Electron, React, and Monaco Editor.

## 🚀 Features

- **Multi-tab Editor** - Full tab management with dirty state tracking
- **File Explorer** - Tree view with lazy loading and file watching
- **LSP Support** - Language Server Protocol integration (TypeScript, Python, Go, Rust)
- **Monaco Editor** - The same editor engine as VS Code
- **Custom Title Bar** - Native-like window controls
- **Status Bar** - Real-time cursor position, language, and encoding info
- **Theme Support** - Dark, Light, and High Contrast themes
- **Keyboard Shortcuts** - VS Code-like keybindings

## 🛠 Tech Stack

- **Runtime**: Electron 28
- **UI**: React 18 + TypeScript
- **Editor**: Monaco Editor 0.45
- **State Management**: Zustand
- **LSP**: vscode-languageserver-node
- **File Watching**: chokidar
- **Build**: Webpack 5

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd iron-ide

# Install dependencies
npm install --legacy-peer-deps

# Start development mode
npm run dev

# Build for production
npm run build

# Package the application
npm run package
```

## 🏗 Architecture

```
iron-ide/
├── src/
│   ├── main/                 # Electron Main Process
│   │   ├── core/             # App initialization
│   │   ├── fs/               # File system operations
│   │   ├── lsp/              # Language Server Protocol
│   │   ├── window/           # Window management
│   │   └── preload.ts        # Preload script (IPC bridge)
│   ├── renderer/             # React Renderer Process
│   │   ├── components/       # UI Components
│   │   │   ├── editor/       # Monaco Editor wrapper
│   │   │   ├── explorer/     # File tree
│   │   │   ├── tabs/         # Tab bar
│   │   │   └── statusbar/    # Status bar
│   │   ├── store/            # Zustand stores
│   │   ├── hooks/            # Custom React hooks
│   │   └── styles/           # CSS styles
│   └── shared/               # Shared types and utilities
│       └── types/            # TypeScript interfaces
├── config/                   # Build configurations
├── public/                   # Static assets
└── dist/                     # Build output
```

## 🔌 LSP Servers

Iron IDE supports the following language servers out of the box:

| Language | Server Command | Package |
|----------|---------------|---------|
| TypeScript | `tsserver` | `typescript` |
| Python | `pyright-langserver --stdio` | `pyright` |
| Go | `gopls` | `golang.org/x/tools/gopls` |
| Rust | `rust-analyzer` | `rust-analyzer` |

Install the required language servers globally:

```bash
npm install -g typescript pyright
go install golang.org/x/tools/gopls@latest
# Rust analyzer comes with rustup
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + O` | Open File |
| `Ctrl/Cmd + S` | Save File |
| `Ctrl/Cmd + W` | Close Tab |
| `Ctrl/Cmd + Shift + P` | Command Palette |
| `Ctrl/Cmd + ` ` | Toggle Terminal |
| `Middle Click` | Close Tab |

## 🎨 Themes

Three built-in themes:
- **Dark** (default) - Easy on the eyes
- **Light** - For bright environments
- **High Contrast** - Maximum visibility

Change themes in settings or via command palette.

## 📝 Roadmap

- [ ] Extension API
- [ ] Integrated Terminal
- [ ] Debug Adapter Protocol (DAP)
- [ ] Git Integration
- [ ] Search & Replace
- [ ] Multi-cursor Editing
- [ ] Split Editor
- [ ] Remote Development (SSH/WSL)
- [ ] Settings Sync

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details.

---

Built with 🔥 by Iron Architect
