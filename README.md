# Optimark

Incremental Markdown parser with a React renderer built for token-by-token LLM streams.

What makes this good:

- Fast append path: parses only new suffix when content grows.
- Active-block state machine: applies delta updates directly to the active tail node when safe.
- Optimistic live preview: renders in-progress markdown as valid structure while typing/streaming.
- React-aware rendering: stable keys + memoized top-level blocks to avoid remount churn.
- Pragmatic API: low-level parser (`StreamingParser`) and high-level React component (`<Markdown />`).

---

## Quick Overview

### Typical LLM + React usage

```tsx
import { useEffect, useState } from "react";
import { Markdown } from "optimark";

export function ChatMessage({ stream }: { stream: AsyncIterable<string> }) {
  const [text, setText] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for await (const chunk of stream) {
        if (cancelled) return;
        setText((prev) => prev + chunk);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stream]);

  return <Markdown text={text} className="markdown" />;
}
```

### Parser-only usage

```ts
import { StreamingParser } from "optimark";

const parser = new StreamingParser("");
parser.append("# Hel");
parser.append("lo\n\n- item");

const liveTree = parser.getLiveTree();
const pendingTail = parser.getPendingText();
```

---

## Incremental and Optimistic Rendering

This project has two related behaviors:

1. **Incremental parsing** (append-driven)
2. **Optimistic rendering** (valid live structure for in-progress syntax)

### Incremental parsing model

- `append(text)` only processes newly added text.
- The parser stores:
  - `committedBlocks`: finalized block nodes
  - `pendingText`: active tail still evolving
  - `liveTree`: `committedBlocks + parse(pendingText)`
  - `committedOffset`: absolute index of committed content
- Blocks commit at blank-line boundaries (`\n\n`), fence-aware (blank lines inside open fences do not prematurely commit).

### Active-block state machine

The parser now uses an internal active-block machine for steady-state streaming updates:

- Keeps a single canonical engine state (`pendingText`, `committedOffset`, `committedBlocks`, `liveTree`).
- Tracks one active tail block (`paragraph`, `heading`, `blockquote`, `code_block`, `list`, `table`).
- Applies typed delta transitions to the active block without reparsing the whole tail.
- Shares list/table/fence primitives between full parsing and incremental states to keep behavior aligned.
- Uses rolling delta-only fence close detection for open code blocks (no repeated full-line splitting per append).
- Falls back to full-tail parse when an append invalidates active-state assumptions.

### Optimistic rendering rules

- Unclosed inline constructs are treated as if they close at the active tail end.
- Example behaviors:
  - `[hel` renders as a live `link` label.
  - `[hello](` and `[hello](ht` stay as `link` nodes while destination grows.
  - Unclosed emphasis/strong/code-span stays structurally valid for preview.
- Some trailing partial markers are buffered to reduce flicker (for example trailing `*`, `_`, or incomplete heading prefix).

### React `optimistic` prop

`<Markdown text={text} optimistic />` is enabled by default.

- `optimistic={true}` (default):
  - If `text` is a prefix extension of previous text, component uses incremental `append(...)`.
  - This keeps parser/node identity stable where possible.
- `optimistic={false}`:
  - Component reparses from scratch on updates.
  - Useful when you want strict reparse semantics over identity reuse.

---

## Full API Overview

Exports:

```ts
export { StreamingParser } from "./src/StreamingParser";
export { Markdown } from "./src/react/Markdown";
export type {
  MarkdownProps,
  MarkdownComponents,
  MarkdownRendererProps,
} from "./src/react/Markdown";
```

### `StreamingParser`

```ts
class StreamingParser {
  constructor(initialText: string, options?: StreamingParserOptions);
  append(text: string): void;
  getLiveTree(): AstNode[];
  getPendingText(): string;
}

type StreamingParserOptions = {
  htmlBlocks?: boolean; // default: false
};
```

### `Markdown`

```ts
type MarkdownProps = {
  text: string;
  optimistic?: boolean; // default: true
  className?: string;   // default: "markdown"
  components?: MarkdownComponents;
};
```

Renders with semantic HTML tags by default (`p`, `h1..h6`, `blockquote`, `ul/ol/li`, `pre/code`, `table`, `a`, `img`, etc.).

### Custom renderers

```ts
type MarkdownRendererProps<T extends AstNode = AstNode> = {
  node: T;
  sourceText: string;
  children: ReactNode[];
  keyPath: string;
  renderChildren: () => ReactNode[];
  defaultRender: () => ReactNode;
};

type MarkdownComponents = {
  [K in AstNode["type"]]?: (props: MarkdownRendererProps<Extract<AstNode, { type: K }>>) => ReactNode;
};
```

Example:

```tsx
<Markdown
  text={text}
  components={{
    link: ({ node, children, defaultRender }) => {
      if (node.url?.startsWith("/")) {
        return <a href={node.url}>{children}</a>;
      }
      return defaultRender();
    },
  }}
/>
```

---

## Full Markdown Overview

Implemented coverage includes:

- Headings: ATX (`#`) and Setext (`===` / `---`)
- Paragraphs and soft/hard line breaks
- Emphasis/strong/strikethrough
- Code spans (single and multi-backtick delimiters) and fenced code blocks (````` and `~~~`, with language/meta)
- Blockquotes (including nested + lazy continuation)
- Lists:
  - unordered (`-`, `*`, `+`)
  - ordered (`1.` and `1)`; large marker numbers supported)
  - task items (`- [ ]`, `- [x]`)
- Thematic breaks (`---`, `***`, `___`, and spaced variants like `- - -`)
- Tables (GFM-style, alignment, nested contexts)
- Links and images:
  - inline
  - reference-style (`[label][ref]`, `[label]` fallback)
  - reference definitions (`[ref]: url "title"`)
  - inline titles (`(url "title")`)
  - inline destination URL population for completed and partial destination parsing
- Autolinks:
  - URL (`<https://...>`)
  - email (`<user@example.com>`)
- HTML:
  - block HTML (opt-in via `htmlBlocks: true`)
  - inline HTML
- Escapes and entity decoding in destinations/titles

### How React stays fast

The React renderer is intentionally designed for streaming updates:

- **Persistent parser instance** in a ref (no re-init on normal append updates).
- **Prefix-diff append path** when text grows (`optimistic=true`).
- **Stable element keys** based on `type + start + siblingIndex` (not `end`) to avoid remounting as tail length grows.
- **Memoized top-level node blocks** so committed blocks do not rerender while only the active tail changes.
- **Identity-aware parser core**: committed block node references are reused when possible.

This combination gives low-latency live updates for long LLM responses without excessive React reconciliation work.

---

## Notes

- HTML block parsing is disabled by default. Enable explicitly with:
  `new StreamingParser(text, { htmlBlocks: true })`.
- HTML nodes are rendered via `dangerouslySetInnerHTML` for `html_block` / `html_inline`.
  Sanitize upstream if content is untrusted (especially if enabling `htmlBlocks`).
- If incoming text is edited in the middle (not append-only), the component/parser reparses as needed.

## Known Limitations And Roadmap

Current behavior intentionally prioritizes streaming UX and stable incremental updates over full strict CommonMark conformance.

Implemented in this expansion:

- Strikethrough parsing (`~~text~~`) including optimistic unclosed rendering.
- Multi-backtick code span delimiter matching.
- Expanded thematic-break handling (underscore and spaced markers).
- Relaxed ordered-list marker digit limits.
- Broadened optimistic ordered partial markers (`3`, `3.`, `3)`).
- More aggressive optimistic autolink/comment promotions before closure.
- Inline link destination URL population for closed/partial destinations.

Next prioritized CommonMark gaps:

1. **Delimiter-run precision**: closer alignment with full emphasis delimiter-open/close rules.
2. **Code-span whitespace normalization**: stricter leading/trailing-space normalization semantics.
3. **HTML block fidelity**: broader CommonMark HTML block categories and termination rules.
4. **List tight/loose semantics**: richer blank-line-driven tight vs loose list behavior.
5. **Reference definition edges**: stricter multiline and whitespace-normalization handling.
