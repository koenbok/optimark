import type { AstNode } from "../../types";
import { V2LineIndex } from "./V2LineIndex";
import { V2SourceBuffer } from "./V2SourceBuffer";
import type { V2Block, V2StateSnapshot } from "./V2Types";

export class V2State {
  readonly sourceBuffer = new V2SourceBuffer();
  readonly lineIndex = new V2LineIndex();
  committedBlocks: V2Block[] = [];
  activeBlocks: V2Block[] = [];
  liveTree: AstNode[] = [];
  private nextBlockIdValue = 1;

  nextBlockId(): number {
    const id = this.nextBlockIdValue;
    this.nextBlockIdValue += 1;
    return id;
  }

  snapshot(): V2StateSnapshot {
    return {
      committedOffset: this.sourceBuffer.getCommittedOffset(),
      pendingText: this.sourceBuffer.getPendingText(),
      committedBlocks: this.committedBlocks,
      activeBlocks: this.activeBlocks,
      liveTree: this.liveTree,
    };
  }
}
