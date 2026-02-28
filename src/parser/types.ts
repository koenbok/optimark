import type { AstNode } from "../types";

export type BlockParseResult = {
  node: AstNode | null;
  consumed: number;
};

export type ActiveBlockKind =
  | "paragraph"
  | "heading"
  | "blockquote"
  | "code_block"
  | "list"
  | "table";

export type ActiveAppendResult = {
  handled: boolean;
  code?: string;
};
