import type { AstNode } from "../../types";
import type { V2Block } from "../core/V2Types";
import { parseInlineText } from "./V2InlinePrimitives";

export type V2InlineResult = {
  blockId: number;
  children: AstNode[];
};

export class V2InlineMachine {
  parseDirtyBlocks(blocks: V2Block[]): V2InlineResult[] {
    return blocks.map((block) => ({
      blockId: block.id,
      children: parseInlineForBlock(block),
    }));
  }
}

function parseInlineForBlock(block: V2Block): AstNode[] {
  if (block.kind === "code_block" || block.kind === "table") return [];

  if (block.kind === "heading") {
    const text = block.raw.replace(/^#{1,6}\s+/, "");
    const start = block.start + (block.raw.length - text.length);
    return parseInlineText(text, start);
  }

  if (block.kind === "blockquote") {
    const normalized = block.raw
      .split("\n")
      .map((line) => line.replace(/^\s*> ?/, ""))
      .join("\n");
    return parseInlineText(normalized, block.start);
  }

  if (block.kind === "list") {
    const normalized = block.raw
      .split("\n")
      .map((line) => line.replace(/^\s*(?:[-+*]|\d{1,9}[.)])\s+/, ""))
      .join("\n");
    return parseInlineText(normalized, block.start);
  }

  return parseInlineText(block.raw, block.start);
}
