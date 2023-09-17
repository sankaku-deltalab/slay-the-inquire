import { TextDocument, Uri } from "vscode";

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
}
