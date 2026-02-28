# CPU Profile

| Duration | Samples | Interval | Functions |
|----------|---------|----------|----------|
| 27.4ms | 21 | 1.0ms | 31 |

**Top 10:** `tryIncrementalListAppend` 30.3%, `endsWith` 24.9%, `regExpMatchFast` 8.9%, `(module)` 8.5%, `pushInto` 5.4%, `tryIncrementalListAppend` 4.8%, `tryIncrementalListAppend` 4.6%, `wouldIntroduceCommitBoundary` 4.6%, `fetch` 4.1%, `buildEscapedMap` 3.3%

## Hot Functions (Self Time)

| Self% | Self | Total% | Total | Function | Location |
|------:|-----:|-------:|------:|----------|----------|
| 30.3% | 8.3ms | 30.3% | 8.3ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:214` |
| 24.9% | 6.8ms | 24.9% | 6.8ms | `endsWith` | `[native code]` |
| 8.9% | 2.4ms | 8.9% | 2.4ms | `regExpMatchFast` | `[native code]` |
| 8.5% | 2.3ms | 95.8% | 26.2ms | `(module)` | `/Users/koen/Documents/MarkdownParser/[eval]:1` |
| 5.4% | 1.4ms | 5.4% | 1.4ms | `pushInto` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:73` |
| 4.8% | 1.3ms | 4.8% | 1.3ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:278` |
| 4.6% | 1.2ms | 4.6% | 1.2ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:218` |
| 4.6% | 1.2ms | 4.6% | 1.2ms | `wouldIntroduceCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:160` |
| 4.1% | 1.1ms | 4.1% | 1.1ms | `fetch` | `[native code]` |
| 3.3% | 930us | 3.3% | 930us | `buildEscapedMap` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:571` |

## Call Tree (Total Time)

| Total% | Total | Self% | Self | Function | Location |
|-------:|------:|------:|-----:|----------|----------|
| 100.0% | 52.5ms | 0.0% | 0us | `moduleEvaluation` | `[native code]` |
| 95.8% | 26.2ms | 8.5% | 2.3ms | `(module)` | `/Users/koen/Documents/MarkdownParser/[eval]:1` |
| 95.8% | 26.2ms | 0.0% | 0us | `async loadAndEvaluateModule` | `[native code]` |
| 95.8% | 26.2ms | 0.0% | 0us | `evaluate` | `[native code]` |
| 87.2% | 23.9ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/StreamingParser.ts:12` |
| 78.3% | 21.4ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:28` |
| 30.3% | 8.3ms | 30.3% | 8.3ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:214` |
| 29.5% | 8.0ms | 0.0% | 0us | `tryIncrementalActiveBlockAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:131` |
| 24.9% | 6.8ms | 24.9% | 6.8ms | `endsWith` | `[native code]` |
| 24.9% | 6.8ms | 0.0% | 0us | `wouldIntroduceCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:163` |
| 8.9% | 2.4ms | 0.0% | 0us | `parseFenceHeader` | `/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:61` |
| 8.9% | 2.4ms | 0.0% | 0us | `updateFenceState` | `/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:44` |
| 8.9% | 2.4ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:33` |
| 8.9% | 2.4ms | 0.0% | 0us | `consumeCommittedBlocks` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:47` |
| 8.9% | 2.4ms | 0.0% | 0us | `findNextCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:17` |
| 8.9% | 2.4ms | 8.9% | 2.4ms | `regExpMatchFast` | `[native code]` |
| 8.8% | 2.4ms | 0.0% | 0us | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:251` |
| 8.2% | 2.2ms | 0.0% | 0us | `async (anonymous)` | `[native code]` |
| 5.4% | 1.4ms | 5.4% | 1.4ms | `pushInto` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:73` |
| 5.4% | 1.4ms | 0.0% | 0us | `pushNode` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:82` |
| 5.4% | 1.4ms | 0.0% | 0us | `parseInline` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:255` |
| 4.8% | 1.3ms | 4.8% | 1.3ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:278` |
| 4.6% | 1.2ms | 4.6% | 1.2ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:218` |
| 4.6% | 1.2ms | 4.6% | 1.2ms | `wouldIntroduceCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:160` |
| 4.1% | 1.1ms | 0.0% | 0us | `(anonymous)` | `[native code]` |
| 4.1% | 1.1ms | 0.0% | 0us | `requestInstantiate` | `[native code]` |
| 4.1% | 1.1ms | 0.0% | 0us | `requestSatisfyUtil` | `[native code]` |
| 4.1% | 1.1ms | 0.0% | 0us | `requestFetch` | `[native code]` |
| 4.1% | 1.1ms | 4.1% | 1.1ms | `fetch` | `[native code]` |
| 3.3% | 930us | 3.3% | 930us | `buildEscapedMap` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:571` |
| 3.3% | 930us | 0.0% | 0us | `parseInline` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:56` |

## Function Details

### `tryIncrementalListAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:214` | Self: 30.3% (8.3ms) | Total: 30.3% (8.3ms) | Samples: 7

**Called by:**
- `append` (7)

### `endsWith`
`[native code]` | Self: 24.9% (6.8ms) | Total: 24.9% (6.8ms) | Samples: 5

**Called by:**
- `wouldIntroduceCommitBoundary` (5)

### `regExpMatchFast`
`[native code]` | Self: 8.9% (2.4ms) | Total: 8.9% (2.4ms) | Samples: 1

**Called by:**
- `parseFenceHeader` (1)

### `(module)`
`/Users/koen/Documents/MarkdownParser/[eval]:1` | Self: 8.5% (2.3ms) | Total: 95.8% (26.2ms) | Samples: 2

**Called by:**
- `evaluate` (20)

**Calls:**
- `append` (18)

### `pushInto`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:73` | Self: 5.4% (1.4ms) | Total: 5.4% (1.4ms) | Samples: 1

**Called by:**
- `pushNode` (1)

### `tryIncrementalListAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:278` | Self: 4.8% (1.3ms) | Total: 4.8% (1.3ms) | Samples: 1

**Called by:**
- `append` (1)

### `tryIncrementalListAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:218` | Self: 4.6% (1.2ms) | Total: 4.6% (1.2ms) | Samples: 1

**Called by:**
- `append` (1)

### `wouldIntroduceCommitBoundary`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:160` | Self: 4.6% (1.2ms) | Total: 4.6% (1.2ms) | Samples: 1

**Called by:**
- `tryIncrementalActiveBlockAppend` (1)

### `fetch`
`[native code]` | Self: 4.1% (1.1ms) | Total: 4.1% (1.1ms) | Samples: 1

**Called by:**
- `requestFetch` (1)

### `buildEscapedMap`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:571` | Self: 3.3% (930us) | Total: 3.3% (930us) | Samples: 1

**Called by:**
- `parseInline` (1)

### `tryIncrementalListAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:251` | Self: 0.0% (0us) | Total: 8.8% (2.4ms) | Samples: 0

**Called by:**
- `append` (2)

**Calls:**
- `parseInline` (1)
- `parseInline` (1)

### `requestFetch`
`[native code]` | Self: 0.0% (0us) | Total: 4.1% (1.1ms) | Samples: 0

**Called by:**
- `async (anonymous)` (1)

**Calls:**
- `fetch` (1)

### `pushNode`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:82` | Self: 0.0% (0us) | Total: 5.4% (1.4ms) | Samples: 0

**Called by:**
- `parseInline` (1)

**Calls:**
- `pushInto` (1)

### `requestSatisfyUtil`
`[native code]` | Self: 0.0% (0us) | Total: 4.1% (1.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `requestInstantiate` (1)

### `parseInline`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:56` | Self: 0.0% (0us) | Total: 3.3% (930us) | Samples: 0

**Called by:**
- `tryIncrementalListAppend` (1)

**Calls:**
- `buildEscapedMap` (1)

### `parseInline`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:255` | Self: 0.0% (0us) | Total: 5.4% (1.4ms) | Samples: 0

**Called by:**
- `tryIncrementalListAppend` (1)

**Calls:**
- `pushNode` (1)

### `requestInstantiate`
`[native code]` | Self: 0.0% (0us) | Total: 4.1% (1.1ms) | Samples: 0

**Called by:**
- `requestSatisfyUtil` (1)

**Calls:**
- `async (anonymous)` (1)

### `updateFenceState`
`/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:44` | Self: 0.0% (0us) | Total: 8.9% (2.4ms) | Samples: 0

**Called by:**
- `findNextCommitBoundary` (1)

**Calls:**
- `parseFenceHeader` (1)

### `(anonymous)`
`[native code]` | Self: 0.0% (0us) | Total: 4.1% (1.1ms) | Samples: 0

**Calls:**
- `requestSatisfyUtil` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:28` | Self: 0.0% (0us) | Total: 78.3% (21.4ms) | Samples: 0

**Called by:**
- `append` (17)

**Calls:**
- `tryIncrementalListAppend` (7)
- `tryIncrementalActiveBlockAppend` (6)
- `tryIncrementalListAppend` (2)
- `tryIncrementalListAppend` (1)
- `tryIncrementalListAppend` (1)

### `tryIncrementalActiveBlockAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:131` | Self: 0.0% (0us) | Total: 29.5% (8.0ms) | Samples: 0

**Called by:**
- `append` (6)

**Calls:**
- `wouldIntroduceCommitBoundary` (5)
- `wouldIntroduceCommitBoundary` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/StreamingParser.ts:12` | Self: 0.0% (0us) | Total: 87.2% (23.9ms) | Samples: 0

**Called by:**
- `(module)` (18)

**Calls:**
- `append` (17)
- `append` (1)

### `findNextCommitBoundary`
`/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:17` | Self: 0.0% (0us) | Total: 8.9% (2.4ms) | Samples: 0

**Called by:**
- `consumeCommittedBlocks` (1)

**Calls:**
- `updateFenceState` (1)

### `moduleEvaluation`
`[native code]` | Self: 0.0% (0us) | Total: 100.0% (52.5ms) | Samples: 0

**Called by:**
- `moduleEvaluation` (20)
- `async loadAndEvaluateModule` (20)

**Calls:**
- `moduleEvaluation` (20)
- `evaluate` (20)

### `consumeCommittedBlocks`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:47` | Self: 0.0% (0us) | Total: 8.9% (2.4ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `findNextCommitBoundary` (1)

### `evaluate`
`[native code]` | Self: 0.0% (0us) | Total: 95.8% (26.2ms) | Samples: 0

**Called by:**
- `moduleEvaluation` (20)

**Calls:**
- `(module)` (20)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:33` | Self: 0.0% (0us) | Total: 8.9% (2.4ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `consumeCommittedBlocks` (1)

### `async (anonymous)`
`[native code]` | Self: 0.0% (0us) | Total: 8.2% (2.2ms) | Samples: 0

**Called by:**
- `async (anonymous)` (1)
- `requestInstantiate` (1)

**Calls:**
- `async (anonymous)` (1)
- `requestFetch` (1)

### `async loadAndEvaluateModule`
`[native code]` | Self: 0.0% (0us) | Total: 95.8% (26.2ms) | Samples: 0

**Calls:**
- `moduleEvaluation` (20)

### `parseFenceHeader`
`/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:61` | Self: 0.0% (0us) | Total: 8.9% (2.4ms) | Samples: 0

**Called by:**
- `updateFenceState` (1)

**Calls:**
- `regExpMatchFast` (1)

### `wouldIntroduceCommitBoundary`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:163` | Self: 0.0% (0us) | Total: 24.9% (6.8ms) | Samples: 0

**Called by:**
- `tryIncrementalActiveBlockAppend` (5)

**Calls:**
- `endsWith` (5)

## Files

| Self% | Self | File |
|------:|-----:|------|
| 44.5% | 12.2ms | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts` |
| 38.0% | 10.4ms | `[native code]` |
| 8.8% | 2.4ms | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts` |
| 8.5% | 2.3ms | `/Users/koen/Documents/MarkdownParser/[eval]` |
