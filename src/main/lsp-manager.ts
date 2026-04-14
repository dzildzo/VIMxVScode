// ============================================================================
// LSP MANAGER - Управление языковыми серверами
// ============================================================================

import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import * as net from 'net';
import { EventEmitter } from 'events';
import {
  ILspConfig,
  ILspServer,
  ILspMessage,
} from '../shared/types';

interface ILspManagerEvents {
  serverStarted: (serverId: string) => void;
  serverStopped: (serverId: string) => void;
  serverError: (serverId: string, error: Error) => void;
  messageReceived: (serverId: string, message: ILspMessage) => void;
  messageSent: (serverId: string, message: ILspMessage) => void;
}

export class LspManager extends EventEmitter {
  private servers: Map<string, ILspServerInstance> = new Map();
  private messageId: number = 0;
  private pendingRequests: Map<number | string, { resolve: (result: any) => void; reject: (error: Error) => void }> = new Map();

  constructor(private rootPath: string) {
    super();
  }

  /**
   * Запуск языкового сервера
   */
  async startServer(serverId: string, config: ILspConfig): Promise<void> {
    if (this.servers.has(serverId)) {
      console.warn(`Server ${serverId} is already running`);
      return;
    }

    const serverInstance: ILspServerInstance = {
      id: serverId,
      config,
      status: 'starting',
      process: null,
      connection: null,
      reader: null,
      writer: null,
    };

    this.servers.set(serverId, serverInstance);

    try {
      // Запускаем процесс языкового сервера
      const process = spawn(config.command, config.args, {
        cwd: this.rootPath,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      serverInstance.process = process;

      // Обработка ошибок процесса
      process.on('error', (error) => {
        serverInstance.status = 'error';
        serverInstance.error = error.message;
        this.emit('serverError', serverId, error);
        console.error(`LSP Server ${serverId} error:`, error);
      });

      process.on('exit', (code) => {
        serverInstance.status = 'stopped';
        this.emit('serverStopped', serverId);
        console.log(`LSP Server ${serverId} exited with code ${code}`);
        this.servers.delete(serverId);
      });

      // Устанавливаем соединение через stdin/stdout
      serverInstance.reader = new LspReader(process.stdout!);
      serverInstance.writer = new LspWriter(process.stdin!);

      // Обработка входящих сообщений
      serverInstance.reader.onMessage((message) => {
        this.handleIncomingMessage(serverId, message);
      });

      // Отправляем initialize запрос
      await this.sendInitialize(serverId);

      serverInstance.status = 'running';
      this.emit('serverStarted', serverId);
      console.log(`LSP Server ${serverId} started successfully`);
    } catch (error) {
      serverInstance.status = 'error';
      serverInstance.error = error instanceof Error ? error.message : String(error);
      this.emit('serverError', serverId, error as Error);
      this.servers.delete(serverId);
      throw error;
    }
  }

  /**
   * Остановка языкового сервера
   */
  async stopServer(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      return;
    }

    try {
      // Отправляем shutdown запрос
      if (server.status === 'running') {
        await this.sendRequest(serverId, 'shutdown', {});
        
        // Отправляем exit уведомление
        await this.sendNotification(serverId, 'exit', {});
      }

      // Завершаем процесс
      if (server.process) {
        server.process.kill();
      }

      this.servers.delete(serverId);
      console.log(`LSP Server ${serverId} stopped`);
    } catch (error) {
      console.error(`Error stopping server ${serverId}:`, error);
      if (server.process) {
        server.process.kill();
      }
      this.servers.delete(serverId);
    }
  }

  /**
   * Остановка всех серверов
   */
  async stopAllServers(): Promise<void> {
    const promises = Array.from(this.servers.keys()).map(id => this.stopServer(id));
    await Promise.all(promises);
  }

  /**
   * Отправка запроса (request)
   */
  async sendRequest<T>(serverId: string, method: string, params: any): Promise<T> {
    const server = this.servers.get(serverId);
    if (!server || server.status !== 'running') {
      throw new Error(`Server ${serverId} is not running`);
    }

    const id = ++this.messageId;
    const message: ILspMessage = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      server.writer!.write(message);
      this.emit('messageSent', serverId, message);

      // Таймаут для запроса (30 секунд)
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${method} timed out`));
        }
      }, 30000);
    });
  }

  /**
   * Отправка уведомления (notification)
   */
  async sendNotification(serverId: string, method: string, params: any): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server || server.status !== 'running') {
      throw new Error(`Server ${serverId} is not running`);
    }

    const message: ILspMessage = {
      jsonrpc: '2.0',
      method,
      params,
    };

    server.writer!.write(message);
    this.emit('messageSent', serverId, message);
  }

  /**
   * Отправка ответа на запрос
   */
  async sendResponse(serverId: string, id: number | string, result: any): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    const message: ILspMessage = {
      jsonrpc: '2.0',
      id,
      result,
    };

    server.writer!.write(message);
    this.emit('messageSent', serverId, message);
  }

  /**
   * Обработка входящего сообщения
   */
  private handleIncomingMessage(serverId: string, message: ILspMessage): void {
    this.emit('messageReceived', serverId, message);

    if (message.id !== undefined) {
      // Это ответ на наш запрос или запрос от сервера
      if (message.result !== undefined || message.error !== undefined) {
        // Ответ на наш запрос
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          this.pendingRequests.delete(message.id);
          if (message.error) {
            pending.reject(new Error(message.error.message));
          } else {
            pending.resolve(message.result);
          }
        }
      } else if (message.method) {
        // Запрос от сервера (например, workspace/applyEdit)
        this.handleServerRequest(serverId, message);
      }
    } else if (message.method) {
      // Уведомление от сервера (например, textDocument/publishDiagnostics)
      this.handleServerNotification(serverId, message);
    }
  }

  /**
   * Обработка запроса от сервера
   */
  private async handleServerRequest(serverId: string, message: ILspMessage): Promise<void> {
    console.log(`Server ${serverId} request:`, message.method);
    
    // По умолчанию отвечаем null для неизвестных методов
    if (message.id !== undefined) {
      await this.sendResponse(serverId, message.id, null);
    }
  }

  /**
   * Обработка уведомления от сервера
   */
  private handleServerNotification(serverId: string, message: ILspMessage): void {
    console.log(`Server ${serverId} notification:`, message.method);
    
    // Здесь можно обрабатывать специфичные уведомления
    // Например: textDocument/publishDiagnostics
  }

  /**
   * Отправка initialize запроса
   */
  private async sendInitialize(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;

    const initializeParams = {
      processId: process.pid,
      clientInfo: {
        name: 'Iron IDE',
        version: '1.0.0',
      },
      locale: 'en',
      rootPath: this.rootPath,
      rootUri: `file://${this.rootPath}`,
      capabilities: {
        textDocument: {
          synchronization: {
            dynamicRegistration: true,
            willSave: true,
            willSaveWaitUntil: true,
            didSave: true,
          },
          completion: {
            dynamicRegistration: true,
            completionItem: {
              snippetSupport: true,
              commitCharactersSupport: true,
              documentationFormat: ['markdown', 'plaintext'],
              deprecatedSupport: true,
              preselectSupport: true,
            },
            contextSupport: true,
          },
          hover: {
            dynamicRegistration: true,
            contentFormat: ['markdown', 'plaintext'],
          },
          signatureHelp: {
            dynamicRegistration: true,
            signatureInformation: {
              documentationFormat: ['markdown', 'plaintext'],
              parameterInformation: { labelOffsetSupport: true },
            },
            contextSupport: true,
          },
          definition: {
            dynamicRegistration: true,
            linkSupport: true,
          },
          references: {
            dynamicRegistration: true,
          },
          documentHighlight: {
            dynamicRegistration: true,
          },
          documentSymbol: {
            dynamicRegistration: true,
            hierarchicalDocumentSymbolSupport: true,
            symbolKind: {
              valueSet: Array.from({ length: 26 }, (_, i) => i + 1),
            },
          },
          codeAction: {
            dynamicRegistration: true,
            codeActionLiteralSupport: {
              codeActionKind: {
                valueSet: ['', 'quickfix', 'refactor', 'refactor.extract', 'refactor.inline', 'refactor.rewrite', 'source', 'source.organizeImports'],
              },
            },
          },
          formatting: {
            dynamicRegistration: true,
          },
          rangeFormatting: {
            dynamicRegistration: true,
          },
          onTypeFormatting: {
            dynamicRegistration: true,
          },
          rename: {
            dynamicRegistration: true,
            prepareSupport: true,
          },
          foldingRange: {
            dynamicRegistration: true,
            rangeLimit: 5000,
            lineFoldingOnly: true,
          },
          diagnostic: {
            dynamicRegistration: true,
            relatedDocumentSupport: true,
          },
        },
        workspace: {
          applyEdit: true,
          workspaceEdit: {
            documentChanges: true,
            resourceOperations: ['create', 'rename', 'delete'],
          },
          didChangeConfiguration: {
            dynamicRegistration: true,
          },
          didChangeWatchedFiles: {
            dynamicRegistration: true,
          },
          symbol: {
            dynamicRegistration: true,
            symbolKind: {
              valueSet: Array.from({ length: 26 }, (_, i) => i + 1),
            },
          },
          configuration: true,
        },
      },
      initializationOptions: server.config.initializationOptions,
    };

    await this.sendRequest(serverId, 'initialize', initializeParams);
    
    // Отправляем initialized уведомление
    await this.sendNotification(serverId, 'initialized', {});
  }

  /**
   * Открытие документа в языковом сервере
   */
  async openDocument(serverId: string, uri: string, languageId: string, version: number, text: string): Promise<void> {
    await this.sendNotification(serverId, 'textDocument/didOpen', {
      textDocument: {
        uri,
        languageId,
        version,
        text,
      },
    });
  }

  /**
   * Изменение документа
   */
  async changeDocument(serverId: string, uri: string, version: number, changes: any[]): Promise<void> {
    await this.sendNotification(serverId, 'textDocument/didChange', {
      textDocument: {
        uri,
        version,
      },
      contentChanges: changes,
    });
  }

  /**
   * Закрытие документа
   */
  async closeDocument(serverId: string, uri: string): Promise<void> {
    await this.sendNotification(serverId, 'textDocument/didClose', {
      textDocument: {
        uri,
      },
    });
  }

  /**
   * Сохранение документа
   */
  async saveDocument(serverId: string, uri: string, text?: string): Promise<void> {
    await this.sendNotification(serverId, 'textDocument/didSave', {
      textDocument: {
        uri,
      },
      text,
    });
  }

  /**
   * Получение автодополнения
   */
  async getCompletion(serverId: string, uri: string, position: { line: number; character: number }): Promise<any> {
    return this.sendRequest(serverId, 'textDocument/completion', {
      textDocument: { uri },
      position,
    });
  }

  /**
   * Получение hover информации
   */
  async getHover(serverId: string, uri: string, position: { line: number; character: number }): Promise<any> {
    return this.sendRequest(serverId, 'textDocument/hover', {
      textDocument: { uri },
      position,
    });
  }

  /**
   * Переход к определению
   */
  async getDefinition(serverId: string, uri: string, position: { line: number; character: number }): Promise<any> {
    return this.sendRequest(serverId, 'textDocument/definition', {
      textDocument: { uri },
      position,
    });
  }

  /**
   * Поиск ссылок
   */
  async getReferences(serverId: string, uri: string, position: { line: number; character: number }, includeDeclaration: boolean): Promise<any> {
    return this.sendRequest(serverId, 'textDocument/references', {
      textDocument: { uri },
      position,
      context: { includeDeclaration },
    });
  }

  /**
   * Переименование символа
   */
  async rename(serverId: string, uri: string, position: { line: number; character: number }, newName: string): Promise<any> {
    return this.sendRequest(serverId, 'textDocument/rename', {
      textDocument: { uri },
      position,
      newName,
    });
  }

  /**
   * Форматирование документа
   */
  async formatDocument(serverId: string, uri: string, options: { tabSize: number; insertSpaces: boolean }): Promise<any> {
    return this.sendRequest(serverId, 'textDocument/formatting', {
      textDocument: { uri },
      options,
    });
  }

  /**
   * Получение статуса сервера
   */
  getServerStatus(serverId: string): ILspServer | null {
    const server = this.servers.get(serverId);
    if (!server) return null;

    return {
      id: server.id,
      config: server.config,
      status: server.status,
      error: server.error,
    };
  }

  /**
   * Получение всех серверов
   */
  getAllServers(): ILspServer[] {
    return Array.from(this.servers.values()).map(server => ({
      id: server.id,
      config: server.config,
      status: server.status,
      error: server.error,
    }));
  }

  /**
   * Проверка, поддерживает ли сервер файл
   */
  supportsFile(serverId: string, filePath: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) return false;

    const extension = path.extname(filePath).slice(1);
    return server.config.fileExtensions.includes(extension);
  }

  /**
   * Поиск сервера для файла
   */
  findServerForFile(filePath: string): string | null {
    for (const [id, server] of this.servers.entries()) {
      if (this.supportsFile(id, filePath)) {
        return id;
      }
    }
    return null;
  }
}

// ============================================================================
// Вспомогательные классы для чтения/записи LSP сообщений
// ============================================================================

interface ILspServerInstance extends ILspServer {
  process: ChildProcess | null;
  connection: net.Socket | null;
  reader: LspReader | null;
  writer: LspWriter | null;
}

/**
 * Чтение LSP сообщений из потока
 */
class LspReader extends EventEmitter {
  private buffer: Buffer = Buffer.alloc(0);
  private contentLength: number = -1;

  constructor(private stream: NodeJS.ReadableStream) {
    super();
    this.stream.on('data', (data: Buffer) => this.onData(data));
  }

  private onData(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data]);
    this.processBuffer();
  }

  private processBuffer(): void {
    while (true) {
      // Если еще не прочитали Content-Length, ищем его
      if (this.contentLength === -1) {
        const headerEnd = this.buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) {
          return; // Ждем больше данных
        }

        const header = this.buffer.slice(0, headerEnd).toString('utf-8');
        const contentLengthMatch = header.match(/Content-Length: (\d+)/);
        
        if (!contentLengthMatch) {
          console.error('Invalid LSP header:', header);
          this.buffer = this.buffer.slice(headerEnd + 4);
          continue;
        }

        this.contentLength = parseInt(contentLengthMatch[1], 10);
        this.buffer = this.buffer.slice(headerEnd + 4);
      }

      // Проверяем, есть ли достаточно данных для тела сообщения
      if (this.buffer.length < this.contentLength) {
        return; // Ждем больше данных
      }

      // Читаем тело сообщения
      const body = this.buffer.slice(0, this.contentLength).toString('utf-8');
      this.buffer = this.buffer.slice(this.contentLength);
      this.contentLength = -1;

      try {
        const message: ILspMessage = JSON.parse(body);
        this.emit('message', message);
      } catch (error) {
        console.error('Failed to parse LSP message:', error);
      }
    }
  }

  onMessage(callback: (message: ILspMessage) => void): void {
    this.on('message', callback);
  }
}

/**
 * Запись LSP сообщений в поток
 */
class LspWriter {
  constructor(private stream: NodeJS.WritableStream) {}

  write(message: ILspMessage): void {
    const body = JSON.stringify(message);
    const contentLength = Buffer.byteLength(body, 'utf-8');
    const header = `Content-Length: ${contentLength}\r\n\r\n`;
    
    this.stream.write(header + body);
  }
}
