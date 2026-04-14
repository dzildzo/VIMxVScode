import { createConnection, IPCMessageReader, IPCMessageWriter, ProposedFeatures } from 'vscode-languageserver/node';
import { TextDocuments } from 'vscode-languageserver/textdocument';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as path from 'path';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

connection.onInitialize((params) => {
  const capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );

  return {
    capabilities: {
      textDocumentSync: {
        openClose: true,
        change: 2,
      },
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.', '"', "'", '/', '@'],
      },
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      documentSymbolProvider: true,
      workspaceSymbolProvider: true,
      diagnosticProvider: {
        interFileDependencies: true,
        workspaceDiagnostics: true,
      },
    },
  };
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(
      'workspace/didChangeConfiguration',
      undefined
    );
  }
  
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(() => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

documents.onDidOpen((event) => {
  connection.console.log(`Document opened: ${event.document.uri}`);
});

documents.onDidChangeContent((event) => {
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

connection.onCompletion((textDocumentPosition) => {
  const position = textDocumentPosition.position;
  
  return [
    {
      label: 'console.log',
      kind: 3, // Function
      detail: 'Logs a message to the console',
      insertText: 'console.log($1)',
      insertTextFormat: 2,
    },
    {
      label: 'function',
      kind: 3,
      detail: 'Function declaration',
      insertText: 'function ${1:name}(${2:params}) {\n  $0\n}',
      insertTextFormat: 2,
    },
    {
      label: 'const',
      kind: 5, // Variable
      detail: 'Constant declaration',
      insertText: 'const ${1:name} = ${2:value};',
      insertTextFormat: 2,
    },
    {
      label: 'import',
      kind: 9, // Module
      detail: 'Import statement',
      insertText: "import { ${1:module} } from '${2:path}';",
      insertTextFormat: 2,
    },
  ];
});

connection.onCompletionResolve((item) => {
  return item;
});

connection.onHover((params) => {
  return {
    contents: {
      kind: 'markdown',
      value: '**Simple LSP Hover**\n\nThis is a basic hover provider for demonstration.',
    },
  };
});

connection.onDefinition((params) => {
  return null;
});

connection.onReferences((params) => {
  return [];
});

connection.onDocumentSymbol((params) => {
  return [];
});

connection.onWorkspaceSymbol((params) => {
  return [];
});

documents.listen(connection);
connection.listen();
