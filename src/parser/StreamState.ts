import type { AstNode } from "../types";
import type { StreamSnapshot } from "./types";

export class StreamState {
  committedBlocks: AstNode[] = [];
  pendingText = "";
  committedOffset = 0;
  liveTree: AstNode[] = [];

  snapshot(): StreamSnapshot {
    return {
      committedBlocks: this.committedBlocks,
      pendingText: this.pendingText,
      committedOffset: this.committedOffset,
      liveTree: this.liveTree,
    };
  }
}
