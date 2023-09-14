import { window, TextDocument, Uri } from "vscode";
import {
  createSourceFile,
  ScriptTarget,
  forEachChild,
  Node,
  isFunctionDeclaration,
  isMethodDeclaration,
} from "typescript";

export type TextRange = {
  uri: Uri;
  text: string;
  start: number;
  end: number;
};

export namespace Search {
  export function searchTargets(
    uri: Uri,
    workspaceState: TextDocument
  ): TextRange[] {
    return searchFunctionNameRanges(uri, workspaceState.getText());
    // TODO: get tooltip text
  }

  function searchFunctionNameRanges(uri: Uri, text: string): TextRange[] {
    const sourceFile = createSourceFile(
      uri.path,
      text,
      ScriptTarget.Latest,
      true
    );

    const functionTargetsMut: TextRange[] = [];
    const traverse = (node: Node): void => {
      if (isFunctionDeclaration(node) || isMethodDeclaration(node)) {
        if (node.name !== undefined) {
          const functionName = node.name.getText();
          const startPosition = node.name.pos + 1;
          const endPosition = node.name.end;

          functionTargetsMut.push({
            uri,
            text: functionName,
            start: startPosition,
            end: endPosition,
          });
        }
      }

      forEachChild(node, traverse);
    };

    traverse(sourceFile);

    return functionTargetsMut;
  }

  // function searchKeywordRanges(
  //   original: TextRange,
  //   keyword: string
  // ): TextRange[] {}
}
