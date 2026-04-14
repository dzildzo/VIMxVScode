// ============================================================================
// TERMINAL MANAGER - Управление интегрированным терминалом
// ============================================================================

import { ChildProcess, spawn, PTY } from 'node-pty';
import { EventEmitter } from 'events';
import { ITerminalInstance, ITerminalConfig, ITerminalBufferLine } from '../shared/types';

interface ITerminalManagerEvents {
  terminalCreated: (terminal: ITerminalInstance) => void;
  terminalDestroyed: (terminalId: string) => void;
  output: (terminalId: string, data: string) => void;
  exit: (terminalId: string, exitCode: number) => void;
}

export class TerminalManager extends EventEmitter {
  private terminals: Map<string, ITerminalInstanceWithPty> = new Map();
  private defaultConfig: Partial<ITerminalConfig> = {
    shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
    cwd: process.cwd(),
    env: process.env as Record<string, string>,
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
  };

  constructor(private config: Partial<ITerminalConfig> = {}) {
    super();
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Создание нового терминала
   */
  createTerminal(
    id: string,
    options: Partial<ITerminalConfig> = {}
  ): ITerminalInstance {
    if (this.terminals.has(id)) {
      throw new Error(`Terminal ${id} already exists`);
    }

    const config: ITerminalConfig = {
      shell: options.shell || this.defaultConfig.shell!,
      cwd: options.cwd || this.defaultConfig.cwd!,
      env: options.env || this.defaultConfig.env!,
      fontSize: options.fontSize || this.defaultConfig.fontSize!,
      fontFamily: options.fontFamily || this.defaultConfig.fontFamily!,
      theme: options.theme || {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#cccccc',
        selection: 'rgba(255, 255, 255, 0.3)',
        colors: {
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#e5e5e5',
        },
      },
    };

    const terminal: ITerminalInstanceWithPty = {
      id,
      name: options.shell?.split('/').pop() || config.shell.split('\\').pop() || 'Terminal',
      cwd: config.cwd,
      shell: config.shell,
      isRunning: true,
      buffer: [],
      scrollTop: 0,
      config,
      pty: null,
      maxLines: 1000,
    };

    try {
      // Создаем PTY процесс
      terminal.pty = spawn(config.shell, [], {
        name: 'xterm-256color',
        cwd: config.cwd,
        env: config.env,
        cols: 80,
        rows: 24,
      });

      // Обработка вывода
      terminal.pty.onData((data: string) => {
        this.handleOutput(id, data);
      });

      // Обработка выхода
      terminal.pty.onExit(({ exitCode }) => {
        terminal.isRunning = false;
        this.emit('exit', id, exitCode);
        console.log(`Terminal ${id} exited with code ${exitCode}`);
      });

      this.terminals.set(id, terminal);
      this.emit('terminalCreated', { ...terminal, pty: undefined });

      console.log(`Terminal ${id} created with shell: ${config.shell}`);
      return { ...terminal, pty: undefined };
    } catch (error) {
      console.error('Failed to create terminal:', error);
      throw error;
    }
  }

  /**
   * Уничтожение терминала
   */
  destroyTerminal(id: string): void {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return;
    }

    if (terminal.pty) {
      terminal.pty.kill();
    }

    this.terminals.delete(id);
    this.emit('terminalDestroyed', id);
    console.log(`Terminal ${id} destroyed`);
  }

  /**
   * Отправка ввода в терминал
   */
  sendInput(id: string, data: string): void {
    const terminal = this.terminals.get(id);
    if (!terminal || !terminal.pty || !terminal.isRunning) {
      return;
    }

    terminal.pty.write(data);
  }

  /**
   * Изменение размера терминала
   */
  resize(id: string, cols: number, rows: number): void {
    const terminal = this.terminals.get(id);
    if (!terminal || !terminal.pty) {
      return;
    }

    terminal.pty.resize(cols, rows);
  }

  /**
   * Очистка буфера терминала
   */
  clear(id: string): void {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return;
    }

    terminal.buffer = [];
    terminal.scrollTop = 0;
    
    // Отправляем команду очистки
    if (terminal.pty && terminal.isRunning) {
      terminal.pty.write('\x1b[2J\x1b[H');
    }
  }

  /**
   * Получение истории буфера
   */
  getBuffer(id: string, startLine?: number, endLine?: number): ITerminalBufferLine[] {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return [];
    }

    if (startLine === undefined && endLine === undefined) {
      return [...terminal.buffer];
    }

    const start = startLine ?? 0;
    const end = endLine ?? terminal.buffer.length;
    return terminal.buffer.slice(start, end);
  }

  /**
   * Прокрутка терминала
   */
  scrollTo(id: string, line: number): void {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return;
    }

    terminal.scrollTop = Math.max(0, Math.min(line, terminal.buffer.length - 1));
  }

  /**
   * Скролл вниз на страницу
   */
  scrollDown(id: string, pages: number = 1): void {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return;
    }

    const viewportHeight = 24; // Примерная высота видимой области
    terminal.scrollTop = Math.min(
      terminal.scrollTop + pages * viewportHeight,
      terminal.buffer.length - 1
    );
  }

  /**
   * Скролл вверх на страницу
   */
  scrollUp(id: string, pages: number = 1): void {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return;
    }

    const viewportHeight = 24;
    terminal.scrollTop = Math.max(0, terminal.scrollTop - pages * viewportHeight);
  }

  /**
   * Получение информации о терминале
   */
  getTerminal(id: string): ITerminalInstance | null {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return null;
    }

    return {
      id: terminal.id,
      name: terminal.name,
      cwd: terminal.cwd,
      shell: terminal.shell,
      pid: terminal.pty?.pid,
      isRunning: terminal.isRunning,
      buffer: terminal.buffer,
      scrollTop: terminal.scrollTop,
    };
  }

  /**
   * Получение всех терминалов
   */
  getAllTerminals(): ITerminalInstance[] {
    return Array.from(this.terminals.values()).map(t => ({
      id: t.id,
      name: t.name,
      cwd: t.cwd,
      shell: t.shell,
      pid: t.pty?.pid,
      isRunning: t.isRunning,
      buffer: t.buffer,
      scrollTop: t.scrollTop,
    }));
  }

  /**
   * Изменение рабочей директории
   */
  changeDirectory(id: string, directory: string): void {
    const terminal = this.terminals.get(id);
    if (!terminal || !terminal.pty || !terminal.isRunning) {
      return;
    }

    // Используем команду cd для смены директории
    const cdCommand = `cd "${directory}"\n`;
    terminal.pty.write(cdCommand);
    terminal.cwd = directory;
  }

  /**
   * Разделение терминала (создание копии)
   */
  splitTerminal(id: string, newId: string): ITerminalInstance | null {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return null;
    }

    return this.createTerminal(newId, {
      shell: terminal.shell,
      cwd: terminal.cwd,
      env: terminal.config.env,
      fontSize: terminal.config.fontSize,
      fontFamily: terminal.config.fontFamily,
      theme: terminal.config.theme,
    });
  }

  /**
   * Обработка вывода из терминала
   */
  private handleOutput(terminalId: string, data: string): void {
    const terminal = this.terminals.get(terminalId);
    if (!terminal) {
      return;
    }

    // Разбиваем данные на строки
    const lines = data.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (i === 0 && terminal.buffer.length > 0) {
        // Добавляем к последней строке буфера
        const lastLine = terminal.buffer[terminal.buffer.length - 1];
        lastLine.content += line;
        lastLine.timestamp = Date.now();
      } else {
        // Создаем новую строку
        terminal.buffer.push({
          content: line,
          isWrapped: false,
          timestamp: Date.now(),
        });
      }
    }

    // Ограничиваем размер буфера
    if (terminal.buffer.length > terminal.maxLines) {
      terminal.buffer = terminal.buffer.slice(-terminal.maxLines);
      terminal.scrollTop = Math.max(0, terminal.scrollTop - (terminal.buffer.length - terminal.maxLines));
    }

    // Автоматически скроллим вниз, если мы уже внизу
    const isAtBottom = terminal.scrollTop >= terminal.buffer.length - 24;
    if (isAtBottom) {
      terminal.scrollTop = Math.max(0, terminal.buffer.length - 24);
    }

    this.emit('output', terminalId, data);
  }

  /**
   * Поиск по истории терминала
   */
  searchInBuffer(id: string, query: string, caseSensitive: boolean = false): { line: number; content: string }[] {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return [];
    }

    const results: { line: number; content: string }[] = [];
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    terminal.buffer.forEach((line, index) => {
      const lineContent = caseSensitive ? line.content : line.content.toLowerCase();
      if (lineContent.includes(searchQuery)) {
        results.push({ line: index, content: line.content });
      }
    });

    return results;
  }

  /**
   * Экспорт истории терминала в файл
   */
  exportHistory(id: string): string {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      return '';
    }

    return terminal.buffer.map(line => line.content).join('\n');
  }

  /**
   * Очистка всех терминалов
   */
  destroyAllTerminals(): void {
    for (const id of this.terminals.keys()) {
      this.destroyTerminal(id);
    }
  }
}

// ============================================================================
// Вспомогательные типы
// ============================================================================

interface ITerminalInstanceWithPty extends ITerminalInstance {
  pty: PTY | null;
  config: ITerminalConfig;
  maxLines: number;
}
