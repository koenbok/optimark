import type { AstNode } from "../types";

export class LiveTreeAssembler {
  replaceActiveTail(
    liveTree: AstNode[],
    committedBlocks: AstNode[],
    activeNodes: AstNode[],
  ): AstNode[] {
    const committedLength = committedBlocks.length;
    if (liveTree.length > committedLength) {
      liveTree.length = committedLength;
    }

    for (let i = 0; i < committedLength; i += 1) {
      if (liveTree[i] !== committedBlocks[i]) {
        liveTree[i] = committedBlocks[i] as AstNode;
      }
    }

    liveTree.push(...activeNodes);
    return liveTree;
  }
}
