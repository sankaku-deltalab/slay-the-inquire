// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Search } from "./search";

const KEYWORDS_FOR_SAMPLE: Record<string, string> = {
  hello: "Text for sample",
  disposable: "Subscribable items?",
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "slay-the-inquire.helloWorld",
    helloWorld
  );
  context.subscriptions.push(disposable);
}

function helloWorld(context: vscode.ExtensionContext): void {
  const keywords = KEYWORDS_FOR_SAMPLE;
  const editor = vscode.window.activeTextEditor;
  if (editor === undefined) {
    return;
  }
  const document = editor.document;
  const uri = document.uri;
  const targets = Search.searchTargets(uri, document, Object.keys(keywords));

  for (const t of targets) {
    const startPos = editor.document.positionAt(t.start);
    const endPos = editor.document.positionAt(t.end);
    const range: vscode.DecorationOptions = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: new vscode.MarkdownString(
        `*${t.text}*\n\n${keywords[t.text]}`
      ),
    };
    const deco = vscode.window.createTextEditorDecorationType({
      textDecoration: "underline",
    });
    editor.setDecorations(deco, [range]);
  }
  vscode.window.showInformationMessage("decorated");
}

// This method is called when your extension is deactivated
export function deactivate() {}
