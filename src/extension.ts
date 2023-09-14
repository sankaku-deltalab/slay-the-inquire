// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Search } from "./search";

const KEYWORDS_FOR_SAMPLE: Record<string, string> = {
  hello: "Text for sample",
  disposable: "Subscribable items?",
};

type State = {
  activeEditor: vscode.TextEditor | undefined;
  timeout: NodeJS.Timeout | undefined;
};

const STATE: State = {
  activeEditor: undefined,
  timeout: undefined,
};

// this work as key of decorations
const DECORATION_TYPE = vscode.window.createTextEditorDecorationType({
  textDecoration: "underline",
});

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      STATE.activeEditor = editor;
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

  STATE.activeEditor = vscode.window.activeTextEditor;
  triggerUpdateDecoration();
}

function updateDecoration(): void {
  const editor = STATE.activeEditor;
  const keywords = KEYWORDS_FOR_SAMPLE;
  if (editor === undefined) {
    return;
  }
  const document = editor.document;
  const uri = document.uri;
  const targets = Search.searchTargets(uri, document, Object.keys(keywords));

  const ranges = targets.map((t) => {
    const startPos = document.positionAt(t.start);
    const endPos = document.positionAt(t.end);
    return {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: new vscode.MarkdownString(
        `*${t.text}*\n\n${keywords[t.text]}`
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
