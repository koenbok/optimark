import type { AstNode } from "../types";
import type { InlineReducer } from "./InlineReducer";
import {
  classifySetextSecondLine,
  isThematicBreakLine,
  parseFenceHeader,
  parseListMarker,
  splitTableSegments as splitTableSegmentsPrimitive,
} from "./SyntaxPrimitives";
import type { ActiveAppendResult, ActiveBlockKind } from "./types";

const FAST_INLINE_CHUNK_PATTERN = /[\\`\n\[\]!<>*_\#]/;

export type ActiveAppendContext = {
  pendingText: string;
  committedOffset: number;
  inline: InlineReducer;
  appendToPending: (chunk: string) => void;
};

export interface ActiveBlockState {
  readonly kind: ActiveBlockKind;
  readonly node: AstNode;
  append(chunk: string, context: ActiveAppendContext): ActiveAppendResult;
}

class ParagraphState implements ActiveBlockState {
  readonly kind = "paragraph" as const;

  constructor(readonly node: Extract<AstNode, { type: "paragraph" }>) {}

  append(chunk: string, context: ActiveAppendContext): ActiveAppendResult {
    if (wouldReclassifyParagraph(context.pendingText, chunk)) {
      return { handled: false, code: "paragraph-reclassification-needed" };
    }
    if (FAST_INLINE_CHUNK_PATTERN.test(chunk)) {
      return { handled: false, code: "chunk-not-fast-inline" };
    }
    if (this.node.children.length !== 1 || this.node.children[0]?.type !== "text") {
      return { handled: false, code: "paragraph-shape-unsupported" };
    }
    if (this.node.start !== context.committedOffset) {
      return { handled: false, code: "paragraph-offset-mismatch" };
    }
    if (this.node.end !== context.committedOffset + context.pendingText.length) {
      return { handled: false, code: "paragraph-end-mismatch" };
    }

    const textNode = this.node.children[0];
    textNode.end += chunk.length;
    this.node.end += chunk.length;
    context.appendToPending(chunk);
    return { handled: true };
  }
}

class HeadingState implements ActiveBlockState {
  readonly kind = "heading" as const;

  constructor(readonly node: Extract<AstNode, { type: "heading" }>) {}

  append(chunk: string, context: ActiveAppendContext): ActiveAppendResult {
    const setextTailClassification = classifySetextTail(context.pendingText);
    if (
      setextTailClassification?.kind === "setext" &&
      setextTailClassification.depth === this.node.depth
    ) {
      const nextClassification = classifySetextTail(context.pendingText + chunk);
      if (nextClassification?.kind === "list") {
        return { handled: false, code: "setext-reclassification-needed" };
      }
      return { handled: false, code: "setext-fast-path-disabled" };
    }
    if (FAST_INLINE_CHUNK_PATTERN.test(chunk)) {
      return { handled: false, code: "chunk-not-fast-inline" };
    }
    if (this.node.children.length !== 1 || this.node.children[0]?.type !== "text") {
      return { handled: false, code: "heading-shape-unsupported" };
    }
    if (this.node.start !== context.committedOffset) {
      return { handled: false, code: "heading-offset-mismatch" };
    }
    if (this.node.end !== context.committedOffset + context.pendingText.length) {
      return { handled: false, code: "heading-end-mismatch" };
    }

    const textNode = this.node.children[0];
    textNode.end += chunk.length;
    this.node.end += chunk.length;
    context.appendToPending(chunk);
    return { handled: true };
  }
}

class BlockquoteState implements ActiveBlockState {
  readonly kind = "blockquote" as const;

  constructor(readonly node: Extract<AstNode, { type: "blockquote" }>) {}

  append(chunk: string, context: ActiveAppendContext): ActiveAppendResult {
    if (FAST_INLINE_CHUNK_PATTERN.test(chunk)) {
      return { handled: false, code: "chunk-not-fast-inline" };
    }
    if (this.node.children.length !== 1) {
      return { handled: false, code: "blockquote-shape-unsupported" };
    }
    const firstChild = this.node.children[0];
    if (!firstChild || firstChild.type !== "paragraph") {
      return { handled: false, code: "blockquote-child-unsupported" };
    }
    if (firstChild.children.length !== 1 || firstChild.children[0]?.type !== "text") {
      return { handled: false, code: "blockquote-inline-unsupported" };
    }
    if (this.node.start !== context.committedOffset) {
      return { handled: false, code: "blockquote-offset-mismatch" };
    }
    if (this.node.end !== context.committedOffset + context.pendingText.length) {
      return { handled: false, code: "blockquote-end-mismatch" };
    }

    const textNode = firstChild.children[0];
    textNode.end += chunk.length;
    firstChild.end += chunk.length;
    this.node.end += chunk.length;
    context.appendToPending(chunk);
    return { handled: true };
  }
}

class CodeBlockState implements ActiveBlockState {
  readonly kind = "code_block" as const;
  private readonly markerChar: string;
  private readonly markerLength: number;
  private lineFencePrefix = 0;
  private lineMode: "prefix" | "suffix" | "invalid" = "prefix";

  constructor(
    readonly node: Extract<AstNode, { type: "code_block" }>,
    marker: string,
    trailingLine: string,
  ) {
    this.markerChar = marker.startsWith("~") ? "~" : "`";
    this.markerLength = marker.length;
    this.seedLineScannerState(trailingLine);
  }

  append(chunk: string, context: ActiveAppendContext): ActiveAppendResult {
    if (this.containsClosingFence(chunk)) {
      return { handled: false, code: "closing-fence-detected" };
    }
    this.node.value += chunk;
    this.node.end += chunk.length;
    context.appendToPending(chunk);
    return { handled: true };
  }

  private containsClosingFence(chunk: string): boolean {
    for (let i = 0; i < chunk.length; i += 1) {
      const char = chunk[i] ?? "";
      if (char === "\n") {
        if (this.currentLineIsClosingFence()) {
          return true;
        }
        this.resetLineScannerState();
        continue;
      }
      this.consumeLineChar(char);
    }

    return this.currentLineIsClosingFence();
  }

  private seedLineScannerState(line: string): void {
    this.resetLineScannerState();
    for (let i = 0; i < line.length; i += 1) {
      this.consumeLineChar(line[i] ?? "");
    }
  }

  private resetLineScannerState(): void {
    this.lineFencePrefix = 0;
    this.lineMode = "prefix";
  }

  private consumeLineChar(char: string): void {
    if (this.lineMode === "invalid") {
      return;
    }

    if (this.lineMode === "prefix") {
      if (char === this.markerChar) {
        this.lineFencePrefix += 1;
        return;
      }
      if (isMarkdownWhitespace(char)) {
        this.lineMode = "suffix";
        return;
      }
      this.lineMode = "invalid";
      return;
    }

    if (!isMarkdownWhitespace(char)) {
      this.lineMode = "invalid";
    }
  }

  private currentLineIsClosingFence(): boolean {
    if (this.lineMode === "invalid") {
      return false;
    }
    return this.lineFencePrefix >= this.markerLength;
  }
}

function isMarkdownWhitespace(char: string): boolean {
  return char === " " || char === "\t" || char === "\r";
}

function wouldReclassifyParagraph(pendingText: string, chunk: string): boolean {
  if (!/[-*_]/.test(chunk)) {
    return false;
  }

  const nextText = pendingText + chunk;
  // Reparse when a plain paragraph tail can become a thematic break
  // after appending more markers (for example "--" -> "---").
  return isThematicBreakLine(nextText);
}

function classifySetextTail(pendingText: string) {
  const firstLineEnd = pendingText.indexOf("\n");
  if (firstLineEnd < 0) {
    return null;
  }
  if (pendingText.indexOf("\n", firstLineEnd + 1) !== -1) {
    return null;
  }
  const firstLine = pendingText.slice(0, firstLineEnd);
  if (firstLine.trim().length === 0) {
    return null;
  }
  const secondLine = pendingText.slice(firstLineEnd + 1);
  return classifySetextSecondLine(secondLine);
}

class ListState implements ActiveBlockState {
  readonly kind = "list" as const;

  constructor(readonly node: Extract<AstNode, { type: "list" }>) {}

  append(chunk: string, context: ActiveAppendContext): ActiveAppendResult {
    if (!chunk.endsWith("\n")) {
      return { handled: false, code: "list-chunk-missing-newline" };
    }
    for (const child of this.node.children) {
      if (
        (child.type !== "list_item" && child.type !== "task_item") ||
        child.children.length !== 1 ||
        child.children[0]?.type !== "paragraph"
      ) {
        return { handled: false, code: "list-existing-shape-unsupported" };
      }
    }

    const lines = chunk.slice(0, -1).split("\n");
    if (lines.length === 0 || lines.some((line) => line.length === 0)) {
      return { handled: false, code: "list-empty-line-found" };
    }

    let pendingCursor = context.pendingText.length;
    const newItems: AstNode[] = [];
    for (const line of lines) {
      const parsedMarker = parseListMarker(line, 0, true);
      if (!parsedMarker) {
        return { handled: false, code: "line-not-list-item" };
      }
      if (parsedMarker.ordered !== this.node.ordered) {
        return { handled: false, code: "list-kind-mismatch" };
      }
      const lineStart = context.committedOffset + pendingCursor;
      const lineEnd = lineStart + line.length;
      const contentStart = lineStart + parsedMarker.markerLength;
      const contentText = line.slice(parsedMarker.markerLength);
      const paragraph: AstNode = {
        type: "paragraph",
        start: contentStart,
        end: lineEnd,
        children: context.inline.parseInline(contentText, contentStart),
      };
      const item: AstNode =
        parsedMarker.isTask
          ? {
              type: "task_item",
              checked: parsedMarker.checked,
              start: lineStart,
              end: lineEnd,
              children: [paragraph],
            }
          : {
              type: "list_item",
              start: lineStart,
              end: lineEnd,
              children: [paragraph],
            };
      newItems.push(item);
      pendingCursor += line.length + 1;
    }

    this.node.children.push(...newItems);
    this.node.end = newItems[newItems.length - 1]?.end ?? this.node.end;
    context.appendToPending(chunk);
    return { handled: true };
  }
}

class TableState implements ActiveBlockState {
  readonly kind = "table" as const;

  constructor(readonly node: Extract<AstNode, { type: "table" }>) {}

  append(chunk: string, context: ActiveAppendContext): ActiveAppendResult {
    if (!chunk.endsWith("\n")) {
      return { handled: false, code: "table-chunk-missing-newline" };
    }

    const columnCount =
      this.node.children[0]?.type === "table_row"
        ? this.node.children[0].children.length
        : this.node.align.length;
    if (columnCount <= 0) {
      return { handled: false, code: "table-invalid-column-count" };
    }

    const lines = chunk.slice(0, -1).split("\n");
    if (lines.length === 0 || lines.some((line) => line.length === 0)) {
      return { handled: false, code: "table-empty-line-found" };
    }

    let pendingCursor = context.pendingText.length;
    const newRows: AstNode[] = [];
    for (const line of lines) {
      const row = parseTableBodyRow(
        line,
        context.committedOffset + pendingCursor,
        columnCount,
        context.inline,
      );
      if (!row) {
        return { handled: false, code: "invalid-table-row" };
      }
      newRows.push(row);
      pendingCursor += line.length + 1;
    }

    this.node.children.push(...newRows);
    this.node.end = newRows[newRows.length - 1]?.end ?? this.node.end;
    context.appendToPending(chunk);
    return { handled: true };
  }
}

function parseTableBodyRow(
  line: string,
  lineStart: number,
  columnCount: number,
  inline: InlineReducer,
): AstNode | null {
  if (!line.includes("|")) {
    return null;
  }
  const segments = splitTableSegmentsPrimitive(line, inline.isEscapedAt.bind(inline));
  if (segments.length === 0) {
    return null;
  }

  const cells: AstNode[] = segments.map((segment) => {
    const trimmed = segment.raw.trim();
    const leading = segment.raw.length - segment.raw.trimStart().length;
    const contentStart = segment.start + leading;
    const contentEnd = contentStart + trimmed.length;
    return {
      type: "table_cell",
      header: false,
      start: lineStart + contentStart,
      end: lineStart + contentEnd,
      children: trimmed.length > 0 ? inline.parseInline(trimmed, lineStart + contentStart) : [],
    };
  });

  const normalized =
    cells.length >= columnCount
      ? cells.slice(0, columnCount)
      : [
          ...cells,
          ...new Array(columnCount - cells.length).fill(null).map(() => {
            const anchor = cells.at(-1)?.end ?? lineStart;
            return {
              type: "table_cell",
              header: false,
              start: anchor,
              end: anchor,
              children: [],
            } as AstNode;
          }),
        ];

  return {
    type: "table_row",
    start: lineStart,
    end: lineStart + line.length,
    children: normalized,
  };
}

function createCodeBlockState(
  node: Extract<AstNode, { type: "code_block" }>,
  pendingText: string,
): CodeBlockState | null {
  const openerLineEnd = pendingText.indexOf("\n");
  const openerLine = openerLineEnd === -1 ? pendingText : pendingText.slice(0, openerLineEnd);
  const header = parseFenceHeader(openerLine);
  if (!header) {
    return null;
  }
  if (header.indent.length > 0 || header.marker.length < 3) {
    return null;
  }

  const trailingLineStart = pendingText.lastIndexOf("\n");
  const trailingLine =
    trailingLineStart === -1 ? pendingText : pendingText.slice(trailingLineStart + 1);
  return new CodeBlockState(node, header.marker, trailingLine);
}

export function createActiveBlockState(node: AstNode, pendingText: string): ActiveBlockState | null {
  switch (node.type) {
    case "paragraph":
      return new ParagraphState(node);
    case "heading":
      return new HeadingState(node);
    case "blockquote":
      return new BlockquoteState(node);
    case "code_block":
      return createCodeBlockState(node, pendingText);
    case "list":
      return new ListState(node);
    case "table":
      return new TableState(node);
    default:
      return null;
  }
}
