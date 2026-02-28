import type { AstNode } from "../types";

export class StreamState {
  committedBlocks: AstNode[] = [];
  pendingText = "";
  committedOffset = 0;
  liveTree: AstNode[] = [];

  appendPending(text: string): void {
    if (!text) {
      return;
    }
    this.pendingText += text;
  }

  commitBoundary(boundary: number): { text: string; consumed: number } {
    const blockText = this.pendingText.slice(0, boundary);
    this.pendingText = this.pendingText.slice(boundary + 2);
    this.committedOffset += boundary + 2;
    return {
      text: blockText,
      consumed: boundary + 2,
    };
  }
}
