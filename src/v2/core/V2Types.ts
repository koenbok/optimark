import type { AstNode } from "../../types";

export type V2BlockKind =
  | "paragraph"
  | "heading"
  | "blockquote"
  | "list"
  | "table"
  | "code_block";

export type V2IndexedLine = {
  text: string;
  start: number;
  end: number;
  terminated: boolean;
};

export type V2Block = {
  id: number;
  kind: V2BlockKind;
  start: number;
  end: number;
  raw: string;
  data?: Record<string, unknown>;
};

export type V2BlockEvent =
  | { type: "open"; block: V2Block }
  | { type: "append"; block: V2Block }
  | { type: "close"; block: V2Block };

export type V2StateSnapshot = {
  committedOffset: number;
  pendingText: string;
  committedBlocks: V2Block[];
  activeBlocks: V2Block[];
  liveTree: AstNode[];
};
