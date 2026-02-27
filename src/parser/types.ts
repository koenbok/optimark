import type { AstNode } from "../types";

export type BlockParseResult = {
  node: AstNode;
  consumed: number;
};

export type StreamSnapshot = {
  committedBlocks: AstNode[];
  pendingText: string;
  committedOffset: number;
  liveTree: AstNode[];
};
