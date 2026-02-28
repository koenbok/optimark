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
      const opener = this.parseFenceHeader(line);
      if (opener) {
        fenceState.inFence = true;
        fenceState.indent = opener.indent;
        fenceState.marker = opener.marker;
      }
      return;
    }

    if (this.isFenceCloseLine(line, fenceState.indent, fenceState.marker)) {
      fenceState.inFence = false;
      fenceState.indent = "";
      fenceState.marker = "";
    }
  }

  private parseFenceHeader(line: string): { indent: string; marker: string } | null {
    const match = line.match(/^(\s*)(`{3,}|~{3,})([^\s`~]*)?(?:\s+(.*))?$/);
    if (!match) {
      return null;
    }
    return { indent: match[1] ?? "", marker: match[2] ?? "```" };
  }

  private isFenceCloseLine(line: string, indent: string, marker: string): boolean {
    const withoutIndent = line.startsWith(indent) ? line.slice(indent.length) : line;
    if (marker.startsWith("`")) {
      return new RegExp(`^\`{${marker.length},}\\s*$`).test(withoutIndent);
    }
    return new RegExp(`^~{${marker.length},}\\s*$`).test(withoutIndent);
  }
}
