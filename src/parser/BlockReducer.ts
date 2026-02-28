import type { AstNode } from "../types";
import {
  buildBlockquoteBoundaryMap,
  buildBoundaryMapForStrippedLines,
  remapNodePositions,
} from "./BoundaryMapper";
import {
  countIndent,
  decodeHtmlEntities,
  isFenceCloseLine,
  parseFenceHeader,
  parseListMarker,
  splitTableSegments,
} from "./SyntaxPrimitives";
import type { BlockParseResult } from "./types";
import { InlineReducer } from "./InlineReducer";

export class BlockReducer {
  constructor(private readonly inline: InlineReducer) {}

  parseBlocks(text: string, absoluteStart: number): AstNode[] {
    const nodes: AstNode[] = [];
    let cursor = 0;

    while (cursor < text.length) {
      while (cursor < text.length && text[cursor] === "\n") {
        cursor += 1;
      }
      if (cursor >= text.length) {
        break;
      }

      const remaining = text.slice(cursor);
      const parsed = this.parseBlockAt(remaining, absoluteStart + cursor);
      if (parsed.node) {
        nodes.push(parsed.node);
      }
      cursor += Math.max(parsed.consumed, 1);
    }

    return nodes;
  }

  parseBlockAt(blockText: string, absoluteStart: number): BlockParseResult {
    const referenceDefinition = this.parseReferenceDefinitionLine(
      blockText,
      absoluteStart,
    );
    if (referenceDefinition) {
      return referenceDefinition;
    }

    const setextHeading = this.parseSetextHeadingBlock(blockText, absoluteStart);
    if (setextHeading) {
      return setextHeading;
    }

    const htmlBlockNode = this.parseHtmlBlock(blockText, absoluteStart);
    if (htmlBlockNode) {
      return {
        node: htmlBlockNode,
        consumed: Math.max(1, htmlBlockNode.end - absoluteStart),
      };
    }

    const thematicBreakNode = this.parseThematicBreak(blockText, absoluteStart);
    if (thematicBreakNode) {
      return { node: thematicBreakNode, consumed: blockText.length };
    }

    const codeBlockNode = this.parseFencedCodeBlock(blockText, absoluteStart);
    if (codeBlockNode) {
      return {
        node: codeBlockNode,
        consumed: Math.max(1, codeBlockNode.end - absoluteStart),
      };
    }

    const blockquoteNode = this.parseBlockquoteBlock(blockText, absoluteStart);
    if (blockquoteNode) {
      return {
        node: blockquoteNode,
        consumed: Math.max(1, blockquoteNode.end - absoluteStart),
      };
    }

    const listNode = this.parseListBlock(blockText, absoluteStart);
    if (listNode) {
      return {
        node: listNode,
        consumed: Math.max(1, listNode.end - absoluteStart),
      };
    }

    const tableNode = this.parseTableBlock(blockText, absoluteStart);
    if (tableNode) {
      return {
        node: tableNode,
        consumed: Math.max(1, tableNode.end - absoluteStart),
      };
    }

    const heading = this.parseHeadingLine(blockText, absoluteStart);
    if (heading) {
      return heading;
    }

    return this.parseParagraph(blockText, absoluteStart);
  }

  private parseHeadingLine(
    blockText: string,
    absoluteStart: number,
  ): BlockParseResult | null {
    const lineEnd = blockText.indexOf("\n");
    const firstLine = lineEnd === -1 ? blockText : blockText.slice(0, lineEnd);
    const headingMatch = firstLine.match(/^(#{1,6})\s+/);
    if (!headingMatch) {
      return null;
    }

    const markerLength = headingMatch[0].length;
    const inlineStart = absoluteStart + markerLength;
    const inlineText = firstLine.slice(markerLength);
    const depth = (headingMatch[1]?.length ?? 1) as 1 | 2 | 3 | 4 | 5 | 6;
    const consumed = firstLine.length;

    return {
      node: {
        type: "heading",
        start: absoluteStart,
        end: absoluteStart + consumed,
        depth,
        children: this.inline.parseInline(inlineText, inlineStart),
      },
      consumed,
    };
  }

  private parseParagraph(blockText: string, absoluteStart: number): BlockParseResult {
    const consumed = this.findParagraphConsumedLength(blockText);
    const paragraphText = blockText.slice(0, consumed);
    const blockEnd = absoluteStart + paragraphText.length;
    return {
      node: {
        type: "paragraph",
        start: absoluteStart,
        end: blockEnd,
        children: this.inline.parseInline(paragraphText, absoluteStart),
      },
      consumed: Math.max(1, paragraphText.length),
    };
  }

  private findParagraphConsumedLength(blockText: string): number {
    let lineStart = 0;
    let lineIndex = 0;

    while (lineStart < blockText.length) {
      const lineEnd = this.findLineEnd(blockText, lineStart);
      const line = blockText.slice(lineStart, lineEnd);

      if (lineIndex > 0 && this.isParagraphInterruptingLine(line)) {
        return Math.max(1, lineStart - 1);
      }

      if (lineEnd >= blockText.length) {
        break;
      }
      lineStart = lineEnd + 1;
      lineIndex += 1;
    }

    return blockText.length;
  }

  private isParagraphInterruptingLine(line: string): boolean {
    const indent = countIndent(line);
    if (indent > 3) return false;
    const rest = line.slice(indent);
    if (rest.length === 0) return false;

    if (rest.startsWith(">")) return true;
    if (/^#{1,6}\s+/.test(rest)) return true;
    if (/^(?:`{3,}|~{3,})/.test(rest)) return true;
    if (/^[-+*]\s+/.test(rest)) return true;
    if (/^1[.)]\s+/.test(rest)) return true;
    if (/^(?:-{3,}|\*{3,})\s*$/.test(rest)) return true;
    if (/^<(?!!--)[A-Za-z/?]/.test(rest) || /^<!--/.test(rest)) return true;

    return false;
  }

  private findLineEnd(text: string, start: number): number {
    const idx = text.indexOf("\n", start);
    return idx === -1 ? text.length : idx;
  }

  private parseReferenceDefinitionLine(
    blockText: string,
    _absoluteStart: number,
  ): BlockParseResult | null {
    const lineEnd = blockText.indexOf("\n");
    const firstLine = lineEnd === -1 ? blockText : blockText.slice(0, lineEnd);
    const match = firstLine.match(
      /^\s{0,3}\[([^\]]+)\]:\s*(\S+)(?:\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\((?:[^)\\]|\\.)*\)))?\s*$/,
    );
    if (!match) {
      return null;
    }

    const label = (match[1] ?? "").trim();
    let destination = (match[2] ?? "").trim();
    if (destination.startsWith("<") && destination.endsWith(">")) {
      destination = destination.slice(1, -1).trim();
    }
    destination = destination.replace(/\\([\\`*{}\[\]()#+\-.!_<>~|])/g, "$1");

    const titleToken = match[3] ?? null;
    const title =
      titleToken && titleToken.length >= 2
        ? decodeHtmlEntities(titleToken.slice(1, -1))
        : null;
    const url =
      destination.length > 0 ? decodeHtmlEntities(destination) : null;

    this.inline.registerReferenceDefinition(label, url, title);
    return { node: null, consumed: firstLine.length };
  }

  private parseSetextHeadingBlock(
    blockText: string,
    absoluteStart: number,
  ): BlockParseResult | null {
    const firstLineEnd = blockText.indexOf("\n");
    if (firstLineEnd < 0) return null;
    const secondLineEnd = blockText.indexOf("\n", firstLineEnd + 1);
    const firstLine = blockText.slice(0, firstLineEnd);
    const secondLine =
      secondLineEnd === -1
        ? blockText.slice(firstLineEnd + 1)
        : blockText.slice(firstLineEnd + 1, secondLineEnd);

    if (firstLine.trim().length === 0) {
      return null;
    }
    const underline = secondLine.match(/^\s{0,3}(=+|-+)\s*$/);
    if (!underline) {
      return null;
    }

    const headingText = firstLine.trim();
    const headingOffsetInLine = firstLine.indexOf(headingText);
    const consumed = firstLineEnd + 1 + secondLine.length;
    return {
      node: {
        type: "heading",
        start: absoluteStart,
        end: absoluteStart + consumed,
        depth: (underline[1]?.startsWith("=") ? 1 : 2) as 1 | 2,
        children: this.inline.parseInline(
          headingText,
          absoluteStart + Math.max(0, headingOffsetInLine),
        ),
      },
      consumed,
    };
  }

  private parseThematicBreak(blockText: string, absoluteStart: number): AstNode | null {
    const trimmed = blockText.trim();
    if (!/^(?:-{3,}|\*{3,})$/.test(trimmed)) {
      return null;
    }

    return {
      type: "thematic_break",
      start: absoluteStart,
      end: absoluteStart + blockText.length,
    };
  }

  private parseFencedCodeBlock(blockText: string, absoluteStart: number): AstNode | null {
    const lines = blockText.split("\n");
    if (lines.length === 0) {
      return null;
    }

    const lineOffsets: number[] = [];
    let runningOffset = 0;
    for (const line of lines) {
      lineOffsets.push(runningOffset);
      runningOffset += line.length + 1;
    }

    const header = parseFenceHeader(lines[0] ?? "");
    if (!header) {
      return null;
    }

    let closingLineIndex = -1;
    for (let i = 1; i < lines.length; i += 1) {
      if (isFenceCloseLine(lines[i] ?? "", header.indent, header.marker)) {
        closingLineIndex = i;
        break;
      }
    }

    const contentStartLine = 1;
    const contentEndExclusive =
      closingLineIndex === -1 ? lines.length : closingLineIndex;
    const valueParts: string[] = [];
    for (let i = contentStartLine; i < contentEndExclusive; i += 1) {
      const line = lines[i] ?? "";
      const normalized =
        line.startsWith(header.indent) ? line.slice(header.indent.length) : line;
      valueParts.push(normalized);
    }
    const value = valueParts.join("\n");

    const endOffset =
      closingLineIndex === -1
        ? blockText.length
        : (lineOffsets[closingLineIndex] ?? blockText.length) +
          (lines[closingLineIndex]?.length ?? 0);

    return {
      type: "code_block",
      start: absoluteStart,
      end: absoluteStart + endOffset,
      language: header.language,
      meta: header.meta,
      value,
    };
  }

  private parseHtmlBlock(blockText: string, absoluteStart: number): AstNode | null {
    const firstLineEnd = blockText.indexOf("\n");
    const firstLine = firstLineEnd === -1 ? blockText : blockText.slice(0, firstLineEnd);
    if (!/^\s*</.test(firstLine)) {
      return null;
    }

    if (/^\s*<!--/.test(firstLine)) {
      const close = blockText.indexOf("-->");
      const consumed = close === -1 ? blockText.length : close + 3;
      return {
        type: "html_block",
        start: absoluteStart,
        end: absoluteStart + consumed,
        value: blockText.slice(0, consumed),
      };
    }

    const singleLineTag = firstLine.match(/^\s*<\/?([A-Za-z][A-Za-z0-9-]*)(?:\s[^<>]*)?>\s*$/);
    if (!singleLineTag) {
      return null;
    }

    const tagName = singleLineTag[1] ?? "";
    const openingTagMatch = firstLine.match(/^\s*<([A-Za-z][A-Za-z0-9-]*)/);
    const isClosingOrSelfClosing =
      /^\s*<\//.test(firstLine) || /\/>\s*$/.test(firstLine);
    if (isClosingOrSelfClosing || !openingTagMatch) {
      return {
        type: "html_block",
        start: absoluteStart,
        end: absoluteStart + firstLine.length,
        value: decodeHtmlEntities(firstLine),
      };
    }

    const lines = blockText.split("\n");
    let consumed = firstLine.length;
    const closingPattern = new RegExp(`^\\s*</${tagName}\\s*>\\s*$`, "i");
    for (let i = 1; i < lines.length; i += 1) {
      consumed += 1 + (lines[i]?.length ?? 0);
      if (closingPattern.test(lines[i] ?? "")) {
        break;
      }
    }

    return {
      type: "html_block",
      start: absoluteStart,
      end: absoluteStart + consumed,
      value: decodeHtmlEntities(blockText.slice(0, consumed)),
    };
  }

  private parseTableBlock(blockText: string, absoluteStart: number): AstNode | null {
    const lines = blockText.split("\n");
    if (lines.length < 2) {
      return null;
    }
    const firstLineTrimmed = (lines[0] ?? "").trimStart();
    if (/^(?:- |\d+\.\s+)/.test(firstLineTrimmed)) {
      return null;
    }

    const lineStarts: number[] = [];
    let runningOffset = 0;
    for (const line of lines) {
      lineStarts.push(runningOffset);
      runningOffset += line.length + 1;
    }

    const header = this.parseTableRowLine(
      lines[0] ?? "",
      absoluteStart + (lineStarts[0] ?? 0),
      true,
    );
    if (!header || header.cells.length === 0) {
      return null;
    }

    const delimiter = this.parseTableDelimiterLine(lines[1] ?? "", true);
    if (!delimiter || delimiter.columns === 0) {
      return null;
    }

    const columnCount = Math.max(header.cells.length, delimiter.columns);
    const headerRow: AstNode = {
      type: "table_row",
      start: header.start,
      end: header.end,
      children: this.normalizeCells(header.cells, columnCount, true),
    };

    const rows: AstNode[] = [headerRow];
    let tableEnd = header.end;

    for (let i = 2; i < lines.length; i += 1) {
      const row = this.parseTableRowLine(
        lines[i] ?? "",
        absoluteStart + (lineStarts[i] ?? 0),
        false,
      );
      if (!row) {
        break;
      }
      rows.push({
        type: "table_row",
        start: row.start,
        end: row.end,
        children: this.normalizeCells(row.cells, columnCount, false),
      });
      tableEnd = row.end;
    }

    if (rows.length === 1) {
      tableEnd = absoluteStart + blockText.length;
    }

    const align =
      delimiter.align.length >= columnCount
        ? delimiter.align.slice(0, columnCount)
        : [
            ...delimiter.align,
            ...new Array(columnCount - delimiter.align.length).fill(null),
          ];

    return {
      type: "table",
      start: absoluteStart,
      end: tableEnd,
      align,
      children: rows,
    };
  }

  private parseTableRowLine(
    line: string,
    lineStart: number,
    header: boolean,
  ): { start: number; end: number; cells: AstNode[] } | null {
    if (!line.includes("|")) {
      return null;
    }
    const segments = splitTableSegments(line, this.inline.isEscapedAt.bind(this.inline));
    if (segments.length < 1) {
      return null;
    }

    const cells: AstNode[] = segments.map((segment) => {
      const trimmed = segment.raw.trim();
      const leading = segment.raw.length - segment.raw.trimStart().length;
      const contentStart = segment.start + leading;
      const contentEnd = contentStart + trimmed.length;
      return {
        type: "table_cell",
        header,
        start: lineStart + contentStart,
        end: lineStart + contentEnd,
        children:
          trimmed.length > 0
            ? this.inline.parseInline(trimmed, lineStart + contentStart)
            : [],
      };
    });

    return {
      start: lineStart,
      end: lineStart + line.length,
      cells,
    };
  }

  private parseTableDelimiterLine(
    line: string,
    optimistic: boolean,
  ): { columns: number; align: Array<"left" | "center" | "right" | null> } | null {
    if (!line.includes("|")) {
      return null;
    }
    const segments = splitTableSegments(line, this.inline.isEscapedAt.bind(this.inline));
    if (segments.length === 0) {
      return null;
    }

    const align: Array<"left" | "center" | "right" | null> = [];
    for (const segment of segments) {
      const token = segment.raw.trim();
      if (!token) continue;
      if (!this.isTableDelimiterToken(token, optimistic)) {
        return null;
      }
      align.push(this.getTableAlignment(token));
    }

    if (align.length === 0) {
      return null;
    }
    return { columns: align.length, align };
  }

  private isTableDelimiterToken(token: string, optimistic: boolean): boolean {
    if (/^:?-+:?$/.test(token)) {
      return true;
    }
    if (!optimistic) {
      return false;
    }
    return /^:?-*:?$/.test(token) && token.includes("-");
  }

  private getTableAlignment(token: string): "left" | "center" | "right" | null {
    const left = token.startsWith(":");
    const right = token.endsWith(":");
    if (left && right) return "center";
    if (left) return "left";
    if (right) return "right";
    return null;
  }

  private normalizeCells(cells: AstNode[], target: number, header: boolean): AstNode[] {
    if (cells.length > target) {
      return cells.slice(0, target);
    }
    if (cells.length === target) {
      return cells;
    }

    const normalized = [...cells];
    const anchor = cells.at(-1)?.end ?? cells.at(0)?.start ?? 0;
    while (normalized.length < target) {
      normalized.push({
        type: "table_cell",
        header,
        start: anchor,
        end: anchor,
        children: [],
      });
    }
    return normalized;
  }

  private parseBlockquoteBlock(blockText: string, absoluteStart: number): AstNode | null {
    const lines = blockText.split("\n");
    if (lines.length === 0) {
      return null;
    }

    const lineOffsets: number[] = [];
    let runningOffset = 0;
    for (const line of lines) {
      lineOffsets.push(runningOffset);
      runningOffset += line.length + 1;
    }

    const firstPrefix = this.getBlockquotePrefixLength(lines[0] ?? "");
    if (firstPrefix === 0) {
      return null;
    }

    const prefixLengths: number[] = [];
    const strippedLines: string[] = [];
    let includedLines = 0;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      const prefixLength = this.getBlockquotePrefixLength(line);
      if (prefixLength > 0) {
        prefixLengths.push(prefixLength);
        strippedLines.push(line.slice(prefixLength));
        includedLines += 1;
        continue;
      }
      if (this.isLazyBlockquoteContinuation(line)) {
        prefixLengths.push(0);
        strippedLines.push(line);
        includedLines += 1;
        continue;
      }
      break;
    }

    if (includedLines === 0) {
      return null;
    }

    const innerText = strippedLines.join("\n");
    const boundaryMap = buildBlockquoteBoundaryMap(
      lines.slice(0, includedLines),
      lineOffsets.slice(0, includedLines),
      prefixLengths,
      absoluteStart,
      innerText.length,
    );

    const parsedInnerNodes = this.parseBlocks(innerText, 0);
    const innerNodes =
      parsedInnerNodes.length > 0
        ? parsedInnerNodes.map((node) => remapNodePositions(node, boundaryMap))
        : [
            remapNodePositions(
              {
                type: "paragraph",
                start: 0,
                end: 0,
                children: [],
              },
              boundaryMap,
            ),
          ];

    return {
      type: "blockquote",
      start: absoluteStart,
      end:
        absoluteStart +
        (lineOffsets[includedLines - 1] ?? 0) +
        (lines[includedLines - 1]?.length ?? 0),
      children: innerNodes,
    };
  }

  private isLazyBlockquoteContinuation(line: string): boolean {
    if (line.trim().length === 0) return false;
    if (this.getBlockquotePrefixLength(line) > 0) return true;
    if (this.isParagraphInterruptingLine(line)) return false;
    return true;
  }

  private getBlockquotePrefixLength(line: string): number {
    if (!line.startsWith(">")) {
      return 0;
    }
    if (line.length > 1 && line[1] === " ") {
      return 2;
    }
    return 1;
  }

  private parseListBlock(blockText: string, absoluteStart: number): AstNode | null {
    const lines = blockText.split("\n");
    const lineStarts: number[] = [];
    let offset = 0;
    for (const line of lines) {
      lineStarts.push(offset);
      offset += line.length + 1;
    }

    const parsed = this.parseListAtIndent(lines, lineStarts, 0, 0, absoluteStart);
    if (!parsed) {
      return null;
    }

    return parsed.node;
  }

  private parseListAtIndent(
    lines: string[],
    lineStarts: number[],
    startLine: number,
    indent: number,
    absoluteStart: number,
  ): { node: AstNode; nextLine: number } | null {
    let lineIndex = startLine;
    let listStart = -1;
    let listEnd = -1;
    const items: AstNode[] = [];
    let listOrdered = false;
    let listStartNumber: number | undefined;

    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      if (line === undefined) {
        break;
      }
      const marker = parseListMarker(line, indent, true);
      if (!marker) {
        break;
      }
      if (items.length === 0) {
        listOrdered = marker.ordered;
        listStartNumber = marker.startNumber;
      } else if (marker.ordered !== listOrdered) {
        break;
      }

      const lineStartOffset = lineStarts[lineIndex];
      if (lineStartOffset === undefined) {
        break;
      }
      const lineStart = absoluteStart + lineStartOffset;
      const markerEndInLine = indent + marker.markerLength;
      let itemEnd = lineStart + line.length;
      const contentLines: string[] = [line];
      const contentLineStarts: number[] = [lineStart];
      const contentStripLengths: number[] = [markerEndInLine];
      lineIndex += 1;

      while (lineIndex < lines.length) {
        const continuationLine = lines[lineIndex];
        if (continuationLine === undefined) {
          break;
        }
        const continuationIndent = countIndent(continuationLine);
        if (continuationIndent <= indent) {
          break;
        }
        if (parseListMarker(continuationLine, continuationIndent, true)) {
          break;
        }

        const continuationStartOffset = lineStarts[lineIndex];
        if (continuationStartOffset === undefined) {
          break;
        }
        const continuationStart = absoluteStart + continuationStartOffset;
        const continuationStrip = Math.min(
          markerEndInLine,
          continuationIndent,
        );
        contentLines.push(continuationLine);
        contentLineStarts.push(continuationStart);
        contentStripLengths.push(continuationStrip);
        itemEnd = Math.max(itemEnd, continuationStart + continuationLine.length);
        lineIndex += 1;
      }

      const primaryNode = this.parseStrippedBlock(
        contentLines,
        contentLineStarts,
        contentStripLengths,
      );
      let itemChildren: AstNode[] = [primaryNode];
      if (primaryNode.type === "paragraph" && contentLines.length > 1) {
        const continuationNode = this.parseStrippedBlock(
          contentLines.slice(1),
          contentLineStarts.slice(1),
          contentStripLengths.slice(1),
        );
        if (continuationNode.type !== "paragraph") {
          const firstLineNode = this.parseStrippedBlock(
            [contentLines[0] ?? ""],
            [contentLineStarts[0] ?? 0],
            [contentStripLengths[0] ?? 0],
          );
          itemChildren = [firstLineNode, continuationNode];
        }
      }

      while (lineIndex < lines.length) {
        const nextLine = lines[lineIndex];
        if (nextLine === undefined) {
          break;
        }
        const nextIndent = countIndent(nextLine);
        if (nextIndent <= indent) {
          break;
        }

        const nested = this.parseListAtIndent(
          lines,
          lineStarts,
          lineIndex,
          nextIndent,
          absoluteStart,
        );
        if (!nested) {
          break;
        }

        itemChildren.push(nested.node);
        itemEnd = Math.max(itemEnd, nested.node.end);
        lineIndex = nested.nextLine;
      }

      const item: AstNode = marker.isTask
        ? {
            type: "task_item",
            checked: marker.checked,
            start: lineStart,
            end: itemEnd,
            children: itemChildren,
          }
        : {
            type: "list_item",
            start: lineStart,
            end: itemEnd,
            children: itemChildren,
          };

      items.push(item);
      if (listStart === -1) {
        listStart = lineStart;
      }
      listEnd = itemEnd;
    }

    if (items.length === 0 || listStart < 0 || listEnd < 0) {
      return null;
    }

    return {
      node: {
        type: "list",
        start: listStart,
        end: listEnd,
        ordered: listOrdered,
        ...(listOrdered && listStartNumber !== undefined
          ? { startNumber: listStartNumber }
          : {}),
        tight: false,
        children: items,
      },
      nextLine: lineIndex,
    };
  }

  private parseStrippedBlock(
    lines: string[],
    lineStarts: number[],
    stripLengths: number[],
  ): AstNode {
    const strippedLines = lines.map((line, i) =>
      line.slice(stripLengths[i] ?? 0),
    );
    const innerText = strippedLines.join("\n");
    const boundaryMap = buildBoundaryMapForStrippedLines(
      lines,
      lineStarts,
      stripLengths,
      innerText.length,
    );
    const parsed = this.parseBlocks(innerText, 0)[0] ?? {
      type: "paragraph",
      start: 0,
      end: 0,
      children: [],
    };
    return remapNodePositions(parsed, boundaryMap);
  }

}
