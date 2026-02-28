import { isFenceCloseLine, parseFenceHeader } from "./SyntaxPrimitives";

type FenceState = {
  inFence: boolean;
  indent: string;
  marker: string;
};

export class LineScanner {
  findNextCommitBoundary(text: string): number {
    const fenceState: FenceState = { inFence: false, indent: "", marker: "" };
    let lineStart = 0;

    while (lineStart <= text.length) {
      const lineEnd =
        lineStart < text.length ? this.findLineEnd(text, lineStart) : text.length;
      const line = text.slice(lineStart, lineEnd);

      this.updateFenceState(line, fenceState);

      if (
        !fenceState.inFence &&
        lineEnd + 1 < text.length &&
        text[lineEnd] === "\n" &&
        text[lineEnd + 1] === "\n"
      ) {
        return lineEnd;
      }

      if (lineEnd >= text.length) {
        break;
      }
      lineStart = lineEnd + 1;
    }

    return -1;
  }

  private findLineEnd(text: string, start: number): number {
    const idx = text.indexOf("\n", start);
    return idx === -1 ? text.length : idx;
  }

  private updateFenceState(line: string, fenceState: FenceState): void {
    if (!fenceState.inFence) {
      const opener = parseFenceHeader(line);
      if (opener) {
        fenceState.inFence = true;
        fenceState.indent = opener.indent;
        fenceState.marker = opener.marker;
      }
      return;
    }

    if (isFenceCloseLine(line, fenceState.indent, fenceState.marker)) {
      fenceState.inFence = false;
      fenceState.indent = "";
      fenceState.marker = "";
    }
  }
}
