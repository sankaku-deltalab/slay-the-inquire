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
    workspaceState: TextDocument,
    keywords: string[]
  ): TextRange[] {
    return searchKeywords(uri, workspaceState.getText(), keywords);
    return searchFunctionNameRanges(uri, workspaceState.getText());
    // TODO: get tooltip text
  }

  function searchKeywords(
    uri: Uri,
    text: string,
    keywords: string[]
  ): TextRange[] {
    const rangesMut: TextRange[] = [];
    keywords.forEach((keyword) => {
      const regex = new RegExp(keyword, "gi");

      // regex: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
      let array1;
      while ((array1 = regex.exec(text)) !== null) {
        rangesMut.push({
          uri: uri,
          start: regex.lastIndex - keyword.length,
          end: regex.lastIndex,
          text: keyword,
        });
      }
    });
    return rangesMut;
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
