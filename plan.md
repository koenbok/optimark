## Findings

- **Critical — block committing is context-blind and splits on raw `\n\n` even inside fenced code**, which corrupts the tree and can’t be recovered after commit.

```36:52:src/Parser.ts
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
```

Repro: `append("```\na\n\nb\n```")` produces a committed `code_block` for only `a`, then the tail is parsed as normal text/code spans.

- **Critical — `parseBlock` is single-node and some block parsers consume only a prefix**, so trailing source text is silently dropped from `liveTree` (and can be dropped permanently once committed).

```88:112:src/Parser.ts
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
```

```270:286:src/Parser.ts
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
```

Repro 1: `append("```\na\n```\ntext")` returns only `code_block`.  
 Repro 2: `append("| h |\n| --- |\n| a |\ntail\n\n")` commits only table rows; `tail` disappears.

- **High — optimistic link parsing is recursively self-calling and can stack overflow on malformed long input** (`"["` repeated).

```1008:1015:src/Parser.ts
    const labelClose = text.indexOf("]", startIndex + 1);
    const hasClosedLabel = labelClose !== -1;
    const labelEndExclusive = hasClosedLabel ? labelClose : text.length;
    const labelText = text.slice(startIndex + 1, labelEndExclusive);
    const labelChildren = this.parseInline(
      labelText,
      absoluteStart + startIndex + 1,
    );
```

Repro: `append("[".repeat(20000))` throws `RangeError: Maximum call stack size exceeded`.

- **Medium — constructor and append paths are inconsistent for multi-block input**, so identical text yields different AST shape depending on API path.

```16:25:src/Parser.ts
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
```

Repro: `new Parser("a\n\nb")` => one paragraph with two soft breaks, while `new Parser("").append("a\n\nb")` => two paragraphs.

- **Medium — closed inline links still never populate `url`**, which makes link nodes incomplete for consumers that need navigation metadata.

```1027:1034:src/Parser.ts
    return {
      node: {
        type: "link",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        url: null,
        title: null,
```

---

## Architecture Simplification

- Move from `parseBlock(text) -> AstNode` to `parseBlockAt(text, offset) -> { node, consumed }`, and loop until consumed text is exhausted.
- Use one block-scanning engine for both `consumeCommittedBlocks()` and `rebuildLiveTree()` so commit/live behavior cannot diverge.
- Keep parser modules separated: `BlockParser`, `InlineParser`, and `OffsetMapper`; `Parser` should mostly orchestrate stream state.
- Standardize parser contract: a block parser either consumes entire candidate slice or explicitly reports consumed span; never “prefix-only without remainder handling”.

---

## Performance Review

- Current append path is effectively **quadratic** when pending text grows without commits; on this machine: 20k char-by-char appends ~3.6s, 40k ~14.4s.
- `pendingText = pendingText.slice(...)` in a loop repeatedly copies strings; use an index cursor over the original buffer to reduce allocations.
- `splitTableSegments()` calls `isEscapedAt()` repeatedly (backward scan each time), which is costly on long table lines with many escapes.
- Recursive `parseInline` for link labels is both a correctness risk (stack overflow) and a performance hotspot; switch to iterative bracket scanning with depth/size guardrails.

---

## Testing Gaps I’d Add Next

- Fenced code block containing blank lines while streaming (`\n\n` inside fence).
- Closed fenced code/table followed by trailing text in same pending chunk.
- Constructor-vs-append parity for multi-block input.
- Pathological malformed inline inputs (`"[".repeat(n)`, mixed escapes) with non-throw guarantees.

All current tests pass (`76/76`), but they miss the failure classes above.
