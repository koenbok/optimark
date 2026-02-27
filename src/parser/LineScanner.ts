type FenceState = {
  inFence: boolean;
  indent: string;
};

export class LineScanner {
  findNextCommitBoundary(text: string): number {
    const fenceState: FenceState = { inFence: false, indent: "" };
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
      const opener = this.parseFenceHeader(line);
      if (opener) {
        fenceState.inFence = true;
        fenceState.indent = opener.indent;
      }
      return;
    }

    if (this.isFenceCloseLine(line, fenceState.indent)) {
      fenceState.inFence = false;
      fenceState.indent = "";
    }
  }

  private parseFenceHeader(line: string): { indent: string } | null {
    const match = line.match(/^(\s*)```([^\s`]*)?(?:\s+(.*))?$/);
    if (!match) {
      return null;
    }
    return { indent: match[1] ?? "" };
  }

  private isFenceCloseLine(line: string, indent: string): boolean {
    const withoutIndent = line.startsWith(indent) ? line.slice(indent.length) : line;
    return /^```(?:\s*)$/.test(withoutIndent);
  }
}
