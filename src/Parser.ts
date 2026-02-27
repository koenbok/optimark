import type { AstNode } from "./types";

type InlineFrame = {
  type: "emphasis" | "strong";
  marker: "*" | "_" | "**" | "__";
  start: number;
  children: AstNode[];
};

export class Parser {
  private liveTree: AstNode[] = [];
  private committedBlocks: AstNode[] = [];
  private pendingText: string;
  private committedOffset = 0;

  constructor(initialText: string) {
    this.pendingText = initialText;
    this.rebuildLiveTree();
  }

  append(text: string): void {
    if (!text) return;
    this.pendingText += text;
    this.consumeCommittedBlocks();
    this.rebuildLiveTree();
  }

  getLiveTree(): AstNode[] {
    return this.liveTree;
  }

  getPendingText(): string {
    return this.pendingText;
  }

  private consumeCommittedBlocks(): void {
    while (true) {
      const boundary = this.pendingText.indexOf("\n\n");
      if (boundary < 0) {
        return;
      }

      const blockText = this.pendingText.slice(0, boundary);
      if (blockText.length > 0) {
        this.committedBlocks.push(
          this.parseBlock(blockText, this.committedOffset),
        );
      }

      this.pendingText = this.pendingText.slice(boundary + 2);
      this.committedOffset += boundary + 2;
    }
  }

  private rebuildLiveTree(): void {
    const pendingSuffixLength = this.getPendingSuffixLength(this.pendingText);
    const parsable = this.pendingText.slice(
      0,
      this.pendingText.length - pendingSuffixLength,
    );
    const activeNodes: AstNode[] = parsable.length
      ? [this.parseBlock(parsable, this.committedOffset)]
      : [];

    this.liveTree = [...this.committedBlocks, ...activeNodes];
  }

  private getPendingSuffixLength(text: string): number {
    if (!text) return 0;

    let pending = 0;
    const headingPrefix = text.match(/(?:^|\n)(#{1,6})$/);
    if (headingPrefix?.[1]) {
      pending = Math.max(pending, headingPrefix[1].length);
    }

    if (this.endsWithUnescapedSingleMarker(text, "*")) {
      pending = Math.max(pending, 1);
    }

    if (this.endsWithUnescapedSingleMarker(text, "_")) {
      pending = Math.max(pending, 1);
    }

    return pending;
  }

  private parseBlock(blockText: string, absoluteStart: number): AstNode {
    const thematicBreakNode = this.parseThematicBreak(blockText, absoluteStart);
    if (thematicBreakNode) {
      return thematicBreakNode;
    }

    const codeBlockNode = this.parseFencedCodeBlock(blockText, absoluteStart);
    if (codeBlockNode) {
      return codeBlockNode;
    }

    const blockquoteNode = this.parseBlockquoteBlock(blockText, absoluteStart);
    if (blockquoteNode) {
      return blockquoteNode;
    }

    const tableNode = this.parseTableBlock(blockText, absoluteStart);
    if (tableNode) {
      return tableNode;
    }

    const listNode = this.parseListBlock(blockText, absoluteStart);
    if (listNode) {
      return listNode;
    }

    const blockEnd = absoluteStart + blockText.length;
    const headingMatch = blockText.match(/^(#{1,6})\s+/);

    if (headingMatch) {
      const markerLength = headingMatch[0].length;
      const inlineStart = absoluteStart + markerLength;
      const inlineText = blockText.slice(markerLength);
      const depth = (headingMatch[1]?.length ?? 1) as 1 | 2 | 3 | 4 | 5 | 6;
      return {
        type: "heading",
        start: absoluteStart,
        end: blockEnd,
        depth,
        children: this.parseInline(inlineText, inlineStart),
      };
    }

    return {
      type: "paragraph",
      start: absoluteStart,
      end: blockEnd,
      children: this.parseInline(blockText, absoluteStart),
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

    const header = this.parseFenceHeader(lines[0] ?? "");
    if (!header) {
      return null;
    }

    let closingLineIndex = -1;
    for (let i = 1; i < lines.length; i += 1) {
      if (this.isFenceCloseLine(lines[i] ?? "", header.indent)) {
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

  private parseFenceHeader(
    line: string,
  ): { indent: string; language: string | null; meta: string | null } | null {
    const match = line.match(/^(\s*)```([^\s`]*)?(?:\s+(.*))?$/);
    if (!match) {
      return null;
    }
    const indent = match[1] ?? "";
    const languageRaw = (match[2] ?? "").trim();
    const metaRaw = (match[3] ?? "").trim();
    return {
      indent,
      language: languageRaw.length > 0 ? languageRaw : null,
      meta: metaRaw.length > 0 ? metaRaw : null,
    };
  }

  private isFenceCloseLine(line: string, indent: string): boolean {
    const withoutIndent = line.startsWith(indent) ? line.slice(indent.length) : line;
    return /^```(?:\s*)$/.test(withoutIndent);
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
    const segments = this.splitTableSegments(line);
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
            ? this.parseInline(trimmed, lineStart + contentStart)
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
    const segments = this.splitTableSegments(line);
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

  private splitTableSegments(
    line: string,
  ): Array<{ raw: string; start: number; end: number }> {
    let start = 0;
    let end = line.length;
    if (line.startsWith("|")) {
      start = 1;
    }
    if (end > start && line[end - 1] === "|" && !this.isEscapedAt(line, end - 1)) {
      end -= 1;
    }

    const segments: Array<{ raw: string; start: number; end: number }> = [];
    let segmentStart = start;
    for (let i = start; i < end; i += 1) {
      if (line[i] === "|" && !this.isEscapedAt(line, i)) {
        segments.push({ raw: line.slice(segmentStart, i), start: segmentStart, end: i });
        segmentStart = i + 1;
      }
    }
    segments.push({ raw: line.slice(segmentStart, end), start: segmentStart, end });
    return segments;
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

    const prefixLengths: number[] = [];
    const strippedLines: string[] = [];

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      const prefixLength = this.getBlockquotePrefixLength(line);
      if (prefixLength === 0) {
        return null;
      }
      prefixLengths.push(prefixLength);
      strippedLines.push(line.slice(prefixLength));
    }

    const innerText = strippedLines.join("\n");
    const boundaryMap = this.buildBlockquoteBoundaryMap(
      lines,
      lineOffsets,
      prefixLengths,
      absoluteStart,
      innerText.length,
    );
    const child = this.remapNodePositions(
      this.parseBlock(innerText, 0),
      boundaryMap,
    );

    return {
      type: "blockquote",
      start: absoluteStart,
      end: absoluteStart + blockText.length,
      children: [child],
    };
  }

  private buildBlockquoteBoundaryMap(
    lines: string[],
    lineOffsets: number[],
    prefixLengths: number[],
    absoluteStart: number,
    innerLength: number,
  ): number[] {
    const map = new Array<number>(innerLength + 1).fill(absoluteStart);
    let innerPos = 0;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      const lineStart = lineOffsets[i] ?? 0;
      const prefixLength = prefixLengths[i] ?? 0;
      const stripped = line.slice(prefixLength);

      map[innerPos] = absoluteStart + lineStart + prefixLength;

      for (let k = 0; k < stripped.length; k += 1) {
        innerPos += 1;
        map[innerPos] = absoluteStart + lineStart + prefixLength + k + 1;
      }

      if (i < lines.length - 1) {
        innerPos += 1;
      }
    }

    return map;
  }

  private remapNodePositions(node: AstNode, boundaryMap: number[]): AstNode {
    const start = boundaryMap[node.start] ?? node.start;
    const end = boundaryMap[node.end] ?? node.end;
    const children =
      "children" in node && Array.isArray(node.children)
        ? node.children.map((child: AstNode) =>
            this.remapNodePositions(child, boundaryMap),
          )
        : undefined;
    return {
      ...node,
      start,
      end,
      ...(children ? { children } : {}),
    };
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
    if (!parsed || parsed.nextLine !== lines.length) {
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
      const marker = this.parseListMarker(line, indent);
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
      const itemTextStart = lineStart + markerEndInLine;
      let itemEnd = lineStart + line.length;
      const contentLines: string[] = [line];
      const contentLineStarts: number[] = [lineStart];
      const contentStripLengths: number[] = [markerEndInLine];
      lineIndex += 1;

      // Consume non-list continuation lines that still belong to this item body.
      while (lineIndex < lines.length) {
        const continuationLine = lines[lineIndex];
        if (continuationLine === undefined) {
          break;
        }
        const continuationIndent = this.countIndent(continuationLine);
        if (continuationIndent <= indent) {
          break;
        }
        if (this.parseListMarker(continuationLine, continuationIndent)) {
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

      // Parse nested lists as long as the next line is more indented.
      while (lineIndex < lines.length) {
        const nextLine = lines[lineIndex];
        if (nextLine === undefined) {
          break;
        }
        const nextIndent = this.countIndent(nextLine);
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

  private parseListMarker(
    line: string,
    indent: number,
  ): {
    markerLength: number;
    isTask: boolean;
    checked: boolean;
    ordered: boolean;
    startNumber?: number;
  } | null {
    if (line.length < indent + 2) {
      return null;
    }
    if (this.countIndent(line) !== indent) {
      return null;
    }

    const rest = line.slice(indent);
    if (rest.startsWith("- ")) {
      const todoMatch = rest.match(/^- \[( |x|X)\](?:\s|$)/);
      if (todoMatch) {
        const markerState = todoMatch[1] ?? " ";
        return {
          markerLength: todoMatch[0].length,
          isTask: true,
          checked: markerState.toLowerCase() === "x",
          ordered: false,
        };
      }

      return {
        markerLength: 2,
        isTask: false,
        checked: false,
        ordered: false,
      };
    }

    const orderedMatch = rest.match(/^(\d+)\.\s+/);
    if (!orderedMatch) {
      return null;
    }

    const startNumber = Number.parseInt(orderedMatch[1] ?? "1", 10);
    return {
      markerLength: orderedMatch[0].length,
      isTask: false,
      checked: false,
      ordered: true,
      startNumber,
    };
  }

  private countIndent(line: string): number {
    let indent = 0;
    while (indent < line.length && line[indent] === " ") {
      indent += 1;
    }
    return indent;
  }

  private parseInline(text: string, absoluteStart: number): AstNode[] {
    const root: AstNode[] = [];
    const stack: InlineFrame[] = [];
    let index = 0;
    const escapedAt = this.buildEscapedMap(text);

    const pushInto = (target: AstNode[], node: AstNode): void => {
      const last = target.at(-1);
      if (
        last &&
        last.type === "text" &&
        node.type === "text" &&
        last.end === node.start
      ) {
        target[target.length - 1] = {
          type: "text",
          start: last.start,
          end: node.end,
        };
        return;
      }
      target.push(node);
    };

    const pushNode = (node: AstNode): void => {
      const parent = stack.at(-1);
      if (parent) {
        pushInto(parent.children, node);
        return;
      }
      pushInto(root, node);
    };

    const isTokenStart = (pos: number): boolean => {
      if (pos >= text.length) return false;
      const char = text[pos];
      if (char === "\n") return true;
      if (char === "\\") return true;
      if (escapedAt[pos]) return false;
      if (char === "[" || char === "`" || char === "<") return true;
      if (char === "!" && pos + 1 < text.length && text[pos + 1] === "[") {
        return true;
      }
      return this.getEmphasisMarkerAt(text, pos) !== null;
    };

    const trimTrailingSpacesFromCurrentText = (count: number): void => {
      const parent = stack.at(-1);
      const target = parent ? parent.children : root;
      const last = target.at(-1);
      if (!last || last.type !== "text") {
        return;
      }
      const available = last.end - last.start;
      if (available <= count) {
        target.pop();
        return;
      }
      target[target.length - 1] = {
        type: "text",
        start: last.start,
        end: last.end - count,
      };
    };

    while (index < text.length) {
      if (text[index] === "\n") {
        const hasTwoSpaces =
          index >= 2 && text[index - 1] === " " && text[index - 2] === " ";
        if (hasTwoSpaces) {
          trimTrailingSpacesFromCurrentText(2);
          pushNode({
            type: "line_break",
            hard: true,
            start: absoluteStart + index - 2,
            end: absoluteStart + index + 1,
          });
        } else {
          pushNode({
            type: "soft_break",
            start: absoluteStart + index,
            end: absoluteStart + index + 1,
          });
        }
        index += 1;
        continue;
      }

      if (text[index] === "\\") {
        const isHardBreakSlash =
          index + 1 < text.length &&
          text[index + 1] === "\n" &&
          !escapedAt[index];
        if (isHardBreakSlash) {
          pushNode({
            type: "line_break",
            hard: true,
            start: absoluteStart + index,
            end: absoluteStart + index + 2,
          });
          index += 2;
          continue;
        }

        const nextIndex = Math.min(text.length, index + 2);
        pushNode({
          type: "text",
          start: absoluteStart + index,
          end: absoluteStart + nextIndex,
        });
        index = nextIndex;
        continue;
      }

      if (!escapedAt[index] && text[index] === "`") {
        const parsedCodeSpan = this.parseOptimisticCodeSpanAt(
          text,
          index,
          absoluteStart,
        );
        pushNode(parsedCodeSpan.node);
        index = parsedCodeSpan.nextIndex;
        continue;
      }

      if (
        !escapedAt[index] &&
        text[index] === "!" &&
        index + 1 < text.length &&
        text[index + 1] === "["
      ) {
        const parsedImage = this.parseOptimisticImageAt(text, index, absoluteStart);
        pushNode(parsedImage.node);
        index = parsedImage.nextIndex;
        continue;
      }

      if (!escapedAt[index] && text[index] === "[") {
        const parsedLink = this.parseOptimisticLinkAt(text, index, absoluteStart);
        pushNode(parsedLink.node);
        index = parsedLink.nextIndex;
        continue;
      }

      if (!escapedAt[index] && text[index] === "<") {
        const parsedAutolink = this.parseAutolinkAt(text, index, absoluteStart);
        if (parsedAutolink) {
          pushNode(parsedAutolink.node);
          index = parsedAutolink.nextIndex;
          continue;
        }
        // Not a valid autolink token; consume '<' as text to guarantee progress.
        pushNode({
          type: "text",
          start: absoluteStart + index,
          end: absoluteStart + index + 1,
        });
        index += 1;
        continue;
      }

      const marker = !escapedAt[index]
        ? this.getEmphasisMarkerAt(text, index)
        : null;
      if (marker !== null) {
        const top = stack[stack.length - 1];
        const markerLength = marker.length;
        const markerStart = absoluteStart + index;

        if (top && top.marker === marker) {
          stack.pop();
          pushNode({
            type: top.type,
            start: top.start,
            end: markerStart + markerLength,
            children: top.children,
          });
          index += markerLength;
          continue;
        }

        stack.push({
          type: markerLength === 2 ? "strong" : "emphasis",
          marker,
          start: markerStart,
          children: [],
        });
        index += markerLength;
        continue;
      }

      const runStart = index;
      while (index < text.length && !isTokenStart(index)) {
        index += 1;
      }

      pushNode({
        type: "text",
        start: absoluteStart + runStart,
        end: absoluteStart + index,
      });
    }

    // Keep the live typing experience smooth by auto-closing unclosed inline tags.
    while (stack.length > 0) {
      const frame = stack.pop() as InlineFrame;
      pushNode({
        type: frame.type,
        start: frame.start,
        end: absoluteStart + text.length,
        children: frame.children,
      });
    }

    return root;
  }

  private parseOptimisticLinkAt(
    text: string,
    startIndex: number,
    absoluteStart: number,
  ): { node: AstNode; nextIndex: number } {
    const labelClose = text.indexOf("]", startIndex + 1);
    const hasClosedLabel = labelClose !== -1;
    const labelEndExclusive = hasClosedLabel ? labelClose : text.length;
    const labelText = text.slice(startIndex + 1, labelEndExclusive);
    const labelChildren = this.parseInline(
      labelText,
      absoluteStart + startIndex + 1,
    );

    let nextIndex = hasClosedLabel ? labelClose + 1 : text.length;
    if (
      hasClosedLabel &&
      nextIndex < text.length &&
      text[nextIndex] === "("
    ) {
      const destinationClose = text.indexOf(")", nextIndex + 1);
      nextIndex = destinationClose === -1 ? text.length : destinationClose + 1;
    }

    return {
      node: {
        type: "link",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        url: null,
        title: null,
        children: labelChildren,
      },
      nextIndex,
    };
  }

  private parseOptimisticCodeSpanAt(
    text: string,
    startIndex: number,
    absoluteStart: number,
  ): { node: AstNode; nextIndex: number } {
    const closingTick = text.indexOf("`", startIndex + 1);
    const hasClosingTick = closingTick !== -1;
    const contentEnd = hasClosingTick ? closingTick : text.length;
    const nextIndex = hasClosingTick ? closingTick + 1 : text.length;

    return {
      node: {
        type: "code_span",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        value: text.slice(startIndex + 1, contentEnd),
      },
      nextIndex,
    };
  }

  private parseOptimisticImageAt(
    text: string,
    startIndex: number,
    absoluteStart: number,
  ): { node: AstNode; nextIndex: number } {
    const labelClose = text.indexOf("]", startIndex + 2);
    const hasClosedLabel = labelClose !== -1;
    const labelEndExclusive = hasClosedLabel ? labelClose : text.length;
    const alt = text.slice(startIndex + 2, labelEndExclusive);

    let nextIndex = hasClosedLabel ? labelClose + 1 : text.length;
    let url: string | null = null;

    if (
      hasClosedLabel &&
      nextIndex < text.length &&
      text[nextIndex] === "("
    ) {
      const destinationClose = text.indexOf(")", nextIndex + 1);
      const destinationEnd =
        destinationClose === -1 ? text.length : destinationClose;
      url = text.slice(nextIndex + 1, destinationEnd);
      nextIndex = destinationClose === -1 ? text.length : destinationClose + 1;
    }

    return {
      node: {
        type: "image",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        url,
        title: null,
        alt,
      },
      nextIndex,
    };
  }

  private parseAutolinkAt(
    text: string,
    startIndex: number,
    absoluteStart: number,
  ): { node: AstNode; nextIndex: number } | null {
    const close = text.indexOf(">", startIndex + 1);
    if (close === -1) {
      return null;
    }
    const raw = text.slice(startIndex + 1, close);
    if (!/^https?:\/\/[^\s>]+$/.test(raw)) {
      return null;
    }
    return {
      node: {
        type: "autolink",
        start: absoluteStart + startIndex,
        end: absoluteStart + close + 1,
        url: raw,
      },
      nextIndex: close + 1,
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
    const boundaryMap = this.buildBoundaryMapForStrippedLines(
      lines,
      lineStarts,
      stripLengths,
      innerText.length,
    );
    return this.remapNodePositions(this.parseBlock(innerText, 0), boundaryMap);
  }

  private getEmphasisMarkerAt(
    text: string,
    pos: number,
  ): "*" | "_" | "**" | "__" | null {
    const next2 = text.slice(pos, pos + 2);
    if (next2 === "**" || next2 === "__") return next2;
    const next1 = text[pos];
    if (next1 === "*" || next1 === "_") return next1;
    return null;
  }

  private buildEscapedMap(text: string): boolean[] {
    const escapedAt = new Array<boolean>(text.length).fill(false);
    let slashRun = 0;
    for (let i = 0; i < text.length; i += 1) {
      escapedAt[i] = slashRun % 2 === 1;
      if (text[i] === "\\") {
        slashRun += 1;
      } else {
        slashRun = 0;
      }
    }
    return escapedAt;
  }

  private isEscapedAt(text: string, pos: number): boolean {
    let slashCount = 0;
    let cursor = pos - 1;
    while (cursor >= 0 && text[cursor] === "\\") {
      slashCount += 1;
      cursor -= 1;
    }
    return slashCount % 2 === 1;
  }

  private endsWithUnescapedSingleMarker(text: string, marker: "*" | "_"): boolean {
    if (!text.endsWith(marker)) return false;
    if (text.endsWith(marker + marker)) return false;
    return !this.isEscapedAt(text, text.length - 1);
  }

  private buildBoundaryMapForStrippedLines(
    lines: string[],
    lineStarts: number[],
    stripLengths: number[],
    innerLength: number,
  ): number[] {
    const map = new Array<number>(innerLength + 1).fill(0);
    let innerPos = 0;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      const lineStart = lineStarts[i] ?? 0;
      const strip = stripLengths[i] ?? 0;
      const stripped = line.slice(strip);
      const contentStart = lineStart + strip;

      map[innerPos] = contentStart;
      for (let k = 0; k < stripped.length; k += 1) {
        innerPos += 1;
        map[innerPos] = contentStart + k + 1;
      }

      if (i < lines.length - 1) {
        innerPos += 1;
      }
    }

    return map;
  }
}
