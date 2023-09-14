// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import { Search } from "./search";
import { Config } from "./config";

type State = {
  activeEditor: vscode.TextEditor | undefined;
  timeout: NodeJS.Timeout | undefined;
  config: Config | undefined;
};

const STATE: State = {
  activeEditor: undefined,
  timeout: undefined,
  config: undefined,
};

// this work as key of decorations
const DECORATION_TYPE = vscode.window.createTextEditorDecorationType({
  textDecoration: "underline",
});

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const workspaces = vscode.workspace.workspaceFolders;
  if (workspaces === undefined || workspaces.length !== 1) {
    return;
  }

  const workspace = workspaces[0];
  const configPath = path.join(
    workspace.uri.fsPath,
    "slay_the_inquire.config.toml"
  );

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      STATE.activeEditor = editor;
      triggerUpdateDecoration();
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidSaveTextDocument(
    (document) => {
      if (document.uri.fsPath !== configPath) {
        return;
      }
      const text = document.getText();
      STATE.config = Config.parse(text);
      triggerUpdateDecoration();
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidOpenTextDocument(
    (e) => {
      triggerUpdateDecoration();
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (e) => {
      triggerUpdateDecoration();
    },
    null,
    context.subscriptions
  );

  vscode.workspace.openTextDocument(configPath).then(
    (document) => {
      const text = document.getText();
      STATE.config = Config.parse(text);
      STATE.activeEditor = vscode.window.activeTextEditor;
      triggerUpdateDecoration();
    },
    () => {
      // no config
    }
  );
}

function updateDecoration(): void {
  const editor = STATE.activeEditor;
  const config = STATE.config;
  if (editor === undefined || config === undefined) {
    return;
  }
  const document = editor.document;
  const uri = document.uri;
  const targets = Search.searchTargets(
    uri,
    document,
    Config.listKeywords(config)
  );

  const ranges = targets.map((t) => {
    const startPos = document.positionAt(t.start);
    const endPos = document.positionAt(t.end);
    return {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: new vscode.MarkdownString(
        `## ${t.text}\n\n${config.tooltips[t.text].description}`
      ),
    };
  });
  editor.setDecorations(DECORATION_TYPE, ranges);
}

function triggerUpdateDecoration() {
  if (STATE.timeout) {
    clearTimeout(STATE.timeout);
  }

  STATE.timeout = setTimeout(updateDecoration, 200);
}

// This method is called when your extension is deactivated
export function deactivate() {}
