# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MarkText is an Electron-based WYSIWYG markdown editor built with Vue 3, Pinia, and electron-vite. This is a modernized fork that migrated from Babel + Webpack to electron-vite.

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Run in development mode
npm run build            # Build renderer/main/preload
npm run lint             # Run ESLint
npm run format           # Run Prettier

# Production builds
npm run build:win        # Build for Windows
npm run build:mac        # Build for macOS
npm run build:linux      # Build for Linux

# Utilities
npm run minify-locales   # Minify locale files (auto-runs in production build)
npm run rebuild-native   # Rebuild native modules for Electron
```

## Architecture

The application is split into three main parts:

### Process Structure
- **Main Process** (`src/main/`): Electron main process handling IO, native dialogs, window management. Entry point: `src/main/index.js`
- **Preload** (`src/preload/`): Bridge between main and renderer processes
- **Renderer Process** (`src/renderer/`): Vue 3 frontend with tabs, sidebar, editing features. Entry point: `src/renderer/src/main.js`

### Core Components
- **Muya** (`src/muya/`): The WYSIWYG editor engine. Pure JavaScript, DOM/BOM only - no Electron or Node.js APIs allowed. Handles markdown parsing, block structure, and real-time preview.
- **Common** (`src/common/`): Shared utilities using only Node.js APIs. Can be imported by main and renderer, but NOT by Muya.
- **CodeMirror**: Source code editor (separate from Muya), used when switching to source mode.

### Module Bundling
- Main and preload: Bundled as **CommonJS**
- Renderer: Bundled as **ES Modules**

### Path Aliases (defined in electron.vite.config.js)
- `@` → `src/renderer/src`
- `common` → `src/common`
- `muya` → `src/muya`
- `main_renderer` → `src/main`

### IPC Communication
Main and renderer processes communicate asynchronously via IPC. See `docs/dev/code/IPC.md`.

### State Management
Uses Pinia stores in `src/renderer/src/store/`. The editor store manages document state and tabs.

## Structure Index

### src/main/ (Main Process)
```
index.js                 # Entry point
app/
  index.js               # App initialization
  windowManager.js       # Window lifecycle management
  accessor.js            # Accessor pattern for app state
windows/
  base.js                # Base window class
  editor.js              # Editor window
  setting.js             # Settings window
menu/
  actions/               # Menu action handlers (file, edit, format, view, etc.)
  templates/             # Menu structure definitions
filesystem/
  index.js               # File I/O operations
  markdown.js            # Markdown file handling
  watcher.js             # File watcher
  encoding.js            # Character encoding
keyboard/
  index.js               # Keyboard shortcuts
  keybindings{Darwin,Linux,Windows}.js  # Platform-specific bindings
preferences/index.js     # User preferences
spellchecker/index.js    # Spellcheck integration
contextMenu/editor/      # Right-click context menu
```

### src/renderer/src/ (Renderer Process)
```
main.js                  # Entry point
Main.vue                 # Root Vue component
pages/
  app.vue                # Main editor page
  preference.vue         # Settings page
components/
  editorWithTabs/
    index.vue            # Tab container
    editor.vue           # Muya editor wrapper
    sourceCode.vue       # CodeMirror source editor
    tabs.vue             # Tab bar
  sideBar/
    index.vue            # Sidebar container
    tree.vue             # File tree
    toc.vue              # Table of contents
    search.vue           # Search panel
  titleBar/index.vue     # Window title bar
  commandPalette/index.vue  # Command palette (Ctrl+P)
  search/index.vue       # Find/replace dialog
store/
  editor.js              # Document state, tabs, Muya instance
  layout.js              # UI layout state
  project.js             # Project/folder state
  preferences.js         # User settings
  treeCtrl.js            # File tree state
  commandCenter.js       # Command palette state
prefComponents/          # Settings UI components
  general/, editor/, theme/, markdown/, image/, keybindings/, spellchecker/
```

### src/muya/lib/ (Editor Engine)
```
index.js                 # Muya entry point
config/index.js          # Editor configuration
contentState/
  index.js               # State management
  *Ctrl.js               # Keyboard/input handlers (arrow, backspace, enter, tab, etc.)
  formatCtrl.js          # Text formatting
  imageCtrl.js           # Image handling
  tableBlockCtrl.js      # Table editing
parser/
  index.js               # Markdown parser
  marked/                # Modified marked.js (lexer, inlineLexer, parser, renderer)
  render/
    renderBlock/         # Block-level rendering
    renderInlines/       # Inline element rendering
eventHandler/
  keyboard.js            # Keyboard events
  clickEvent.js          # Mouse events
  clipboard.js           # Copy/paste
  dragDrop.js            # Drag and drop
ui/                      # Floating UI components (tooltips, selectors)
```

### src/common/ (Shared)
```
commands/constants.js    # Command IDs
encoding.js              # Encoding utilities
filesystem/              # Cross-process file utilities
keybinding/index.js      # Keybinding parser
i18n.js                  # i18n utilities
```

## Development Notes

- Hot reload works for renderer only. Main/preload require dev server restart.
- Native dependencies require Python ≥3.12 and Node.js 22.x (matching Electron's Node version).
- Windows: Requires Visual Studio 2022 Build Tools with Spectre-mitigated MSVC libs.
