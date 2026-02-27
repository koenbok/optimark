# Streaming Markdown Parser Rules

This parser is **incremental** and **optimistic**:

- Incremental: `append(text)` only processes newly added text.
- Optimistic: the live tree assumes likely closures for in-progress markdown.

## Core Model

- `pendingText`: active, not-yet-committed tail.
- `committedBlocks`: finalized block nodes that do not change.
- `liveTree`: current view = `committedBlocks + parsed(pendingText)`.
- `committedOffset`: absolute position for committed content.

## Block Rules

- Blocks are committed when a double newline (`\n\n`) is found.
- Content before `\n\n` becomes stable in `committedBlocks`.
- Remaining tail stays in `pendingText` and is reparsed optimistically.

## Inline Rules

- `*` / `_` and `**` / `__` use stack-based parsing.
- Unclosed emphasis/strong is auto-closed at end of active parse window.
- Trailing partial markers are buffered:
  - single trailing `*` or `_` is held back
  - trailing heading prefix (`\n#`, `\n##`, etc.) is held back

## Optimistic Link Rules

- If `[` appears, assume a closing `]` for live parsing.
  - Example: `[hel` is treated as a link with label `hel`.
- If `[label]` exists, promote it to a `link` node immediately.
  - Destination is optional in the live view.
- If `[label](` exists, keep it as a link while destination grows.
  - Example: `[hello](ht` is still a link node.
- If destination closes (`)`), link remains finalized as a link node.

## Practical Consequences

- The live tree is always structurally valid for rendering/preview.
- Tree shape can evolve as more text is appended.
- Only committed blocks are guaranteed stable between appends.
