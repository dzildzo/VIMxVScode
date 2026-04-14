import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ILspSettings, IPosition, ICompletionItem, IDiagnostic, IHover } from '../../shared/types';

interface LspServerInstance {
  id: string;
  languageId: string;
  process: ChildProcess;
  messageId: number;
  pendingRequests: Map<number | string, { resolve: (value: unknown) => void; reject: (error: Error) => void }>;
  capabilities: Record<string, unknown> | null;
  rootUri: string | null;
  isInitialized: boolean;
}

export class LspManager {
  private servers: Map<string, LspServerInstance> = new Map();
  private settings: ILspSettings | null = null;

  constructor() {
    // Initialize LSP manager
  }

  public async initialize(workspacePath: string, settings: ILspSettings): Promise<void> {
    this.settings = settings;
    
    if (!settings.enabled) {
      console.log('LSP is disabled');
      return;
    }

    const rootUri = `file://${workspacePath}`;

    // Start servers for enabled languages
    for (const [languageId, config] of Object.entries(settings.servers)) {
      if (config.enabled) {
        try {
          await this.startServer(languageId, config.command, config.args, rootUri);
        } catch (error) {
          console.error(`Failed to start LSP server for ${languageId}:`, error);
        }
      }
    }
  }

  private async startServer(
    languageId: string,
    command: string,
    args: string[],
    rootUri: string
  ): Promise<void> {
    console.log(`Starting LSP server for ${languageId}: ${command} ${args.join(' ')}`);

    const process = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    const server: LspServerInstance = {
      id: uuidv4(),
      languageId,
      process,
      messageId: 0,
      pendingRequests: new Map(),
      capabilities: null,
      rootUri,
      isInitialized: false,
    };

    // Handle stdout
    let buffer = '';
    process.stdout?.on('data', (data: Buffer) => {
      buffer += data.toString();
      
      // Process complete messages
      while (true) {
        const headerEnd = buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) break;

        const headers = buffer.substring(0, headerEnd);
        const contentLengthMatch = headers.match(/Content-Length: (\d+)/);
        
        if (!contentLengthMatch) {
          buffer = buffer.substring(headerEnd + 4);
          continue;
        }

        const contentLength = parseInt(contentLengthMatch[1], 10);
        const messageStart = headerEnd + 4;
        const messageEnd = messageStart + contentLength;

        if (buffer.length < messageEnd) break;

        const messageBody = buffer.substring(messageStart, messageEnd);
        buffer = buffer.substring(messageEnd);

        try {
          const message = JSON.parse(messageBody);
          this.handleMessage(server, message);
        } catch (error) {
          console.error('Error parsing LSP message:', error);
        }
      }
    });

    // Handle stderr
    process.stderr?.on('data', (data: Buffer) => {
      console.error(`LSP ${languageId} stderr:`, data.toString());
    });

    // Handle process exit
    process.on('exit', (code) => {
      console.log(`LSP server ${languageId} exited with code ${code}`);
      this.servers.delete(languageId);
    });

    process.on('error', (error) => {
      console.error(`LSP server ${languageId} error:`, error);
    });

    this.servers.set(languageId, server);

    // Send initialize request
    await this.sendInitializeRequest(server, rootUri);
  }

  private sendInitializeRequest(server: LspServerInstance, rootUri: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = ++server.messageId;
      
      server.pendingRequests.set(id, { resolve, reject });

      const params = {
        processId: process.pid,
        clientInfo: {
          name: 'Iron IDE',
          version: '1.0.0',
        },
        locale: 'en',
        rootUri,
        initializationOptions: {},
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
            },
            hover: {
              dynamicRegistration: true,
              contentFormat: ['markdown', 'plaintext'],
            },
            definition: {
              dynamicRegistration: true,
            },
            references: {
              dynamicRegistration: true,
            },
            diagnostics: {
              dynamicRegistration: true,
            },
          },
          workspace: {
            workspaceFolders: true,
            applyEdit: true,
          },
        },
        workspaceFolders: [
          {
            uri: rootUri,
            name: path.basename(rootUri),
          },
        ],
      };

      this.sendMessage(server, {
        jsonrpc: '2.0',
        id,
        method: 'initialize',
        params,
      });
    });
  }

  private handleMessage(server: LspServerInstance, message: Record<string, unknown>): void {
    const { id, result, error, method, params } = message;

    // Response to our request
    if (id !== undefined) {
      const pending = server.pendingRequests.get(id);
      if (pending) {
        server.pendingRequests.delete(id);
        if (error) {
          pending.reject(new Error((error as Record<string, string>).message));
        } else {
          pending.resolve(result);
          
          // Store capabilities if this was initialize response
          if (method === undefined && result && typeof result === 'object') {
            server.capabilities = result as Record<string, unknown>;
            server.isInitialized = true;
            
            // Send initialized notification
            this.sendNotification(server, 'initialized', {});
          }
        }
      }
      return;
    }

    // Server-initiated request
    if (method !== undefined) {
      this.handleServerRequest(server, method as string, params);
      return;
    }

    // Notification
    if (method !== undefined && params !== undefined) {
      this.handleNotification(server, method as string, params);
    }
  }

  private handleServerRequest(_server: LspServerInstance, _method: string, _params: unknown): void {
    // Handle server-initiated requests (e.g., workspace/applyEdit)
    // For MVP, we'll just acknowledge them
  }

  private handleNotification(server: LspServerInstance, method: string, params: unknown): void {
    switch (method) {
      case 'textDocument/publishDiagnostics':
        // Forward diagnostics to renderer
        this.forwardToRenderer('lsp:diagnostics', {
          languageId: server.languageId,
          ...params,
        });
        break;
      default:
        console.log(`Unhandled LSP notification: ${method}`);
    }
  }

  public async sendRequest(
    languageId: string,
    method: string,
    params: unknown
  ): Promise<unknown> {
    const server = this.servers.get(languageId);
    if (!server) {
      throw new Error(`LSP server for ${languageId} is not running`);
    }

    if (!server.isInitialized) {
      throw new Error(`LSP server for ${languageId} is not initialized`);
    }

    return new Promise((resolve, reject) => {
      const id = ++server.messageId;
      server.pendingRequests.set(id, { resolve, reject });

      this.sendMessage(server, {
        jsonrpc: '2.0',
        id,
        method,
        params,
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (server.pendingRequests.has(id)) {
          server.pendingRequests.delete(id);
          reject(new Error(`Request ${method} timed out`));
        }
      }, 30000);
    });
  }

  private sendNotification(server: LspServerInstance, method: string, params: unknown): void {
    this.sendMessage(server, {
      jsonrpc: '2.0',
      method,
      params,
    });
  }

  private sendMessage(server: LspServerInstance, message: Record<string, unknown>): void {
    const content = JSON.stringify(message);
    const header = `Content-Length: ${Buffer.byteLength(content)}\r\n\r\n`;
    
    server.process.stdin?.write(header + content);
  }

  public async didOpenTextDocument(
    languageId: string,
    uri: string,
    text: string,
    languageServerId: string
  ): Promise<void> {
    const server = this.servers.get(languageServerId);
    if (!server) return;

    this.sendNotification(server, 'textDocument/didOpen', {
      textDocument: {
        uri,
        languageId,
        version: 1,
        text,
      },
    });
  }

  public async didChangeTextDocument(
    languageId: string,
    uri: string,
    text: string,
    version: number
  ): Promise<void> {
    const server = this.servers.get(languageId);
    if (!server) return;

    this.sendNotification(server, 'textDocument/didChange', {
      textDocument: {
        uri,
        version,
      },
      contentChanges: [{ text }],
    });
  }

  public async didCloseTextDocument(languageId: string, uri: string): Promise<void> {
    const server = this.servers.get(languageId);
    if (!server) return;

    this.sendNotification(server, 'textDocument/didClose', {
      textDocument: {
        uri,
      },
    });
  }

  public async getCompletions(
    languageId: string,
    uri: string,
    position: IPosition
  ): Promise<ICompletionItem[]> {
    const result = await this.sendRequest(languageId, 'textDocument/completion', {
      textDocument: { uri },
      position,
    });

    if (!result) return [];

    // Handle both CompletionList and CompletionItem[]
    const items = Array.isArray(result) ? result : (result as Record<string, unknown>).items || [];
    
    return items.map((item: Record<string, unknown>) => ({
      label: item.label as string,
      kind: (item.kind as number) || 1,
      detail: item.detail as string | undefined,
      documentation: item.documentation as string | undefined,
      insertText: (item.textEdit as Record<string, string> | undefined)?.newText || item.insertText as string | undefined,
    }));
  }

  public async getHover(
    languageId: string,
    uri: string,
    position: IPosition
  ): Promise<IHover | null> {
    const result = await this.sendRequest(languageId, 'textDocument/hover', {
      textDocument: { uri },
      position,
    });

    return result as IHover | null;
  }

  public async getDefinition(
    languageId: string,
    uri: string,
    position: IPosition
  ): Promise<unknown> {
    return await this.sendRequest(languageId, 'textDocument/definition', {
      textDocument: { uri },
      position,
    });
  }

  public updateSettings(settings: ILspSettings): void {
    this.settings = settings;
    
    // Restart servers if needed
    // For MVP, we'll just log the change
    console.log('LSP settings updated');
  }

  public async shutdown(): Promise<void> {
    const shutdownPromises: Promise<void>[] = [];

    for (const [languageId, server] of this.servers) {
      try {
        // Send shutdown request
        await this.sendRequest(languageId, 'shutdown', {}).catch(() => {});
        
        // Send exit notification
        this.sendNotification(server, 'exit', {});
        
        // Give it a moment to shut down gracefully
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force kill if still running
        if (server.process.exitCode === null) {
          server.process.kill();
        }
      } catch (error) {
        console.error(`Error shutting down LSP server ${languageId}:`, error);
      }
    }

    this.servers.clear();
    await Promise.all(shutdownPromises);
  }

  private forwardToRenderer(channel: string, data: unknown): void {
    // In a real implementation, this would use ipcMain to send to renderer
    // For now, we'll just log
    console.log(`Forwarding to renderer [${channel}]:`, data);
  }
}
