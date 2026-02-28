import { appendEvent, closeEvent, openEvent } from "./V2BlockEvents";
import { createBlockquoteState } from "./states/BlockquoteState";
import { appendLine, type V2BlockState } from "./states/V2BlockState";
import { createCodeBlockState } from "./states/CodeBlockState";
import { createHeadingState } from "./states/HeadingState";
import { createListState } from "./states/ListState";
import { createParagraphState } from "./states/ParagraphState";
import { createTableState } from "./states/TableState";
import type { V2Block, V2BlockEvent } from "../core/V2Types";

type Line = {
  text: string;
  start: number;
  end: number;
};

export type V2BlockMachineResult = {
  consumedChars: number;
  committedBlocks: V2Block[];
  activeBlocks: V2Block[];
  events: V2BlockEvent[];
};

export class V2BlockMachine {
  parsePending(
    pendingText: string,
    baseOffset: number,
    nextBlockId: () => number,
  ): V2BlockMachineResult {
    const lastBoundary = findLastCommitBoundaryOutsideFence(pendingText);
    const consumedChars = lastBoundary < 0 ? 0 : lastBoundary + 2;
    const committedText =
      consumedChars > 0 ? pendingText.slice(0, consumedChars) : "";
    const activeText =
      consumedChars > 0 ? pendingText.slice(consumedChars) : pendingText;

    const committed = parseBlocks(
      committedText,
      baseOffset,
      nextBlockId,
      false,
    );
    const active = parseBlocks(
      activeText,
      baseOffset + consumedChars,
      nextBlockId,
      true,
    );

    const events: V2BlockEvent[] = [];
    for (const block of committed) {
      events.push(openEvent(block), closeEvent(block));
    }
    for (const block of active) {
      events.push(openEvent(block), appendEvent(block));
    }

    return {
      consumedChars,
      committedBlocks: committed,
      activeBlocks: active,
      events,
    };
  }
}

function parseBlocks(
  text: string,
  baseOffset: number,
  nextBlockId: () => number,
  allowUnclosedFence: boolean,
): V2Block[] {
  if (!text) return [];
  const lines = indexLines(text, baseOffset);
  const blocks: V2Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line) break;
    if (line.text.trim().length === 0) {
      i += 1;
      continue;
    }

    if (isFenceOpener(line.text)) {
      const parsed = parseCodeBlock(lines, i, nextBlockId, allowUnclosedFence);
      blocks.push(parsed.block);
      i = parsed.nextIndex;
      continue;
    }

    if (isHeading(line.text)) {
      const state = createHeadingState(line.text, line.start, line.end);
      blocks.push(stateToBlock(state, nextBlockId()));
      i += 1;
      continue;
    }

    if (isTableHeader(lines, i)) {
      const parsed = parseTable(lines, i, nextBlockId);
      blocks.push(parsed.block);
      i = parsed.nextIndex;
      continue;
    }

    if (isListItem(line.text)) {
      const parsed = parseList(lines, i, nextBlockId);
      blocks.push(parsed.block);
      i = parsed.nextIndex;
      continue;
    }

    if (isBlockquote(line.text)) {
      const parsed = parseBlockquote(lines, i, nextBlockId);
      blocks.push(parsed.block);
      i = parsed.nextIndex;
      continue;
    }

    const parsed = parseParagraph(lines, i, nextBlockId);
    blocks.push(parsed.block);
    i = parsed.nextIndex;
  }

  return blocks;
}

function parseCodeBlock(
  lines: Line[],
  startIndex: number,
  nextBlockId: () => number,
  allowUnclosedFence: boolean,
): { block: V2Block; nextIndex: number } {
  const first = lines[startIndex]!;
  const state = createCodeBlockState(first.text, first.start, first.end);
  const marker = String(state.data?.marker ?? "```");
  let i = startIndex + 1;
  let closed = false;
  while (i < lines.length) {
    const line = lines[i]!;
    appendLine(state, line.text, line.end);
    if (isFenceClose(line.text, marker)) {
      closed = true;
      i += 1;
      break;
    }
    i += 1;
  }
  if (!closed && !allowUnclosedFence) {
    i = lines.length;
  }
  return { block: stateToBlock(state, nextBlockId()), nextIndex: i };
}

function parseTable(
  lines: Line[],
  startIndex: number,
  nextBlockId: () => number,
): { block: V2Block; nextIndex: number } {
  const first = lines[startIndex]!;
  const state = createTableState(first.text, first.start, first.end);
  let i = startIndex + 1;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.text.trim().length === 0 || !line.text.includes("|")) {
      break;
    }
    appendLine(state, line.text, line.end);
    i += 1;
  }
  return { block: stateToBlock(state, nextBlockId()), nextIndex: i };
}

function parseList(
  lines: Line[],
  startIndex: number,
  nextBlockId: () => number,
): { block: V2Block; nextIndex: number } {
  const first = lines[startIndex]!;
  const state = createListState(first.text, first.start, first.end);
  const ordered = Boolean(state.data?.ordered);
  let i = startIndex + 1;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.text.trim().length === 0) break;
    if (!isListItem(line.text)) break;
    if (ordered !== isOrderedListItem(line.text)) break;
    appendLine(state, line.text, line.end);
    i += 1;
  }
  return { block: stateToBlock(state, nextBlockId()), nextIndex: i };
}

function parseBlockquote(
  lines: Line[],
  startIndex: number,
  nextBlockId: () => number,
): { block: V2Block; nextIndex: number } {
  const first = lines[startIndex]!;
  const state = createBlockquoteState(first.text, first.start, first.end);
  let i = startIndex + 1;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.text.trim().length === 0) break;
    if (!isBlockquote(line.text) && isHardBlockInterruptor(line.text)) break;
    appendLine(state, line.text, line.end);
    i += 1;
  }
  return { block: stateToBlock(state, nextBlockId()), nextIndex: i };
}

function parseParagraph(
  lines: Line[],
  startIndex: number,
  nextBlockId: () => number,
): { block: V2Block; nextIndex: number } {
  const first = lines[startIndex]!;
  const state = createParagraphState(first.text, first.start, first.end);
  let i = startIndex + 1;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.text.trim().length === 0 || isHardBlockInterruptor(line.text)) {
      break;
    }
    appendLine(state, line.text, line.end);
    i += 1;
  }
  return { block: stateToBlock(state, nextBlockId()), nextIndex: i };
}

function stateToBlock(state: V2BlockState, id: number): V2Block {
  return {
    id,
    kind: state.kind,
    start: state.start,
    end: state.end,
    raw: state.lines.join("\n"),
    data: state.data,
  };
}

function indexLines(text: string, baseOffset: number): Line[] {
  const lines: Line[] = [];
  let cursor = 0;
  while (cursor <= text.length) {
    const end = text.indexOf("\n", cursor);
    if (end === -1) {
      lines.push({
        text: text.slice(cursor),
        start: baseOffset + cursor,
        end: baseOffset + text.length,
      });
      break;
    }
    lines.push({
      text: text.slice(cursor, end),
      start: baseOffset + cursor,
      end: baseOffset + end,
    });
    cursor = end + 1;
  }
  return lines;
}

function findLastCommitBoundaryOutsideFence(text: string): number {
  let inFence = false;
  let marker = "";
  let lineStart = 0;
  let lastBoundary = -1;

  while (lineStart <= text.length) {
    const lineEnd = findLineEnd(text, lineStart);
    const line = text.slice(lineStart, lineEnd);

    if (!inFence) {
      const match = line.match(/^(\s*)(`{3,}|~{3,})([^\s`~]*)?(?:\s+(.*))?$/);
      if (match?.[2]) {
        inFence = true;
        marker = match[2];
      }
    } else if (isFenceClose(line, marker)) {
      inFence = false;
      marker = "";
    }

    if (
      !inFence &&
      lineEnd + 1 < text.length &&
      text[lineEnd] === "\n" &&
      text[lineEnd + 1] === "\n"
    ) {
      lastBoundary = lineEnd;
    }

    if (lineEnd >= text.length) break;
    lineStart = lineEnd + 1;
  }

  return lastBoundary;
}

function findLineEnd(text: string, start: number): number {
  const idx = text.indexOf("\n", start);
  return idx === -1 ? text.length : idx;
}

function isFenceOpener(line: string): boolean {
  return /^(\s*)(`{3,}|~{3,})([^\s`~]*)?(?:\s+(.*))?$/.test(line);
}

function isFenceClose(line: string, marker: string): boolean {
  if (!marker) return false;
  if (marker.startsWith("`")) {
    return new RegExp(`^\`{${marker.length},}\\s*$`).test(line.trimStart());
  }
  return new RegExp(`^~{${marker.length},}\\s*$`).test(line.trimStart());
}

function isHeading(line: string): boolean {
  return /^#{1,6}\s+/.test(line);
}

function isListItem(line: string): boolean {
  return /^\s*(?:[-+*]|\d{1,9}[.)])\s+/.test(line);
}

function isOrderedListItem(line: string): boolean {
  return /^\s*\d{1,9}[.)]\s+/.test(line);
}

function isBlockquote(line: string): boolean {
  return /^\s*> ?/.test(line);
}

function isTableHeader(lines: Line[], index: number): boolean {
  const header = lines[index]?.text ?? "";
  const delimiter = lines[index + 1]?.text ?? "";
  return (
    header.includes("|") &&
    /^(?:\s*\|)?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)*(?:\|)?\s*$/.test(delimiter)
  );
}

function isHardBlockInterruptor(line: string): boolean {
  return (
    isFenceOpener(line) ||
    isHeading(line) ||
    isListItem(line) ||
    isBlockquote(line) ||
    /^-{3,}$/.test(line.trim()) ||
    /^={3,}$/.test(line.trim())
  );
}
