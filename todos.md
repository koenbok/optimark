# Parser Roadmap Todo

## 1) Inline Code + Escapes
- [x] Add `code_span` parsing with backticks.
- [x] Add escape handling (`\\*`, `\\[`, `\\]`, `\\\\`).
- [x] Add interaction cases with links and emphasis.
- [x] Add incremental/optimistic behavior tests first, then implementation.

## 2) Blockquotes
- [x] Add `blockquote` block parsing for `>` lines.
- [x] Add nested blockquote support.
- [x] Add mixed structures (`> - item`, `> - [ ] task`).
- [x] Add tests for incremental append transitions.
- [x] Add escape/inline-code behavior inside blockquotes.
- [x] Fix offset mapping when blockquote prefix width varies by line.

## 3) Ordered Lists
- [x] Add ordered list parsing (`1. item`).
- [x] Track `startNumber` metadata.
- [x] Add mixed nested ordered/unordered list support.
- [x] Add sibling and interruption behavior tests.

## 4) Code Blocks
- [x] Add fenced code block parsing (triple backticks).
- [x] Capture `language` and `meta`.
- [x] Add optimistic handling for unfinished fences in live parsing.
- [x] Add nested-context tests (inside blockquotes/lists).

## 5) Hard/Soft Breaks
- [x] Add hard break parsing (`two spaces + newline`, `\\` + newline).
- [x] Add soft break behavior inside paragraphs/list items.
- [x] Add offset/position tests for line break nodes.

## Later
- [x] Images and autolinks.
- [x] Thematic breaks.
- [x] Tables.

## Additional Markdown Coverage
- [ ] Add HTML block parsing.
- [ ] Add inline HTML parsing.
- [ ] Add reference link parsing (`[label][ref]`, `[label]` fallback behavior).
- [ ] Add reference image parsing.
- [ ] Parse and resolve link/image reference definitions (`[ref]: url "title"`).
- [ ] Add link/image title parsing for inline destinations (`(url "title")`).
- [ ] Add email autolink parsing (`<user@example.com>`).
- [ ] Expand ordered-list edge-case handling (interruption and spacing semantics).
- [ ] Add fenced code block `~~~` support.
- [ ] Add broader escape handling for additional punctuation.
- [ ] Add HTML/entity decoding behavior (`&amp;`, `&lt;`, numeric entities).
- [ ] Add Setext heading parsing (`Title` + `===` / `---`).
- [ ] Decide and implement table-cell block-content policy (inline-only vs block-level nesting).
- [ ] Add stricter blockquote/list/table precedence + continuation semantics (CommonMark/GFM parity pass).
