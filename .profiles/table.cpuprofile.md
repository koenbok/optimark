# CPU Profile

| Duration | Samples | Interval | Functions |
|----------|---------|----------|----------|
| 11.3ms | 9 | 1.0ms | 24 |

**Top 10:** `endsWith` 43.6%, `parseModule` 12.2%, `parseHtmlBlock` 11.4%, `push` 11.0%, `fetch` 10.9%, `startsWith` 10.6%

## Hot Functions (Self Time)

| Self% | Self | Total% | Total | Function | Location |
|------:|-----:|-------:|------:|----------|----------|
| 43.6% | 4.9ms | 43.6% | 4.9ms | `endsWith` | `[native code]` |
| 12.2% | 1.3ms | 12.2% | 1.3ms | `parseModule` | `[native code]` |
| 11.4% | 1.3ms | 11.4% | 1.3ms | `parseHtmlBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts` |
| 11.0% | 1.2ms | 11.0% | 1.2ms | `push` | `[native code]` |
| 10.9% | 1.2ms | 10.9% | 1.2ms | `fetch` | `[native code]` |
| 10.6% | 1.2ms | 10.6% | 1.2ms | `startsWith` | `[native code]` |

## Call Tree (Total Time)

| Total% | Total | Self% | Self | Function | Location |
|-------:|------:|------:|-----:|----------|----------|
| 100.0% | 17.3ms | 0.0% | 0us | `moduleEvaluation` | `[native code]` |
| 76.8% | 8.6ms | 0.0% | 0us | `(module)` | `/Users/koen/Documents/MarkdownParser/[eval]:1` |
| 76.8% | 8.6ms | 0.0% | 0us | `async loadAndEvaluateModule` | `[native code]` |
| 76.8% | 8.6ms | 0.0% | 0us | `evaluate` | `[native code]` |
| 76.8% | 8.6ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/StreamingParser.ts:12` |
| 65.3% | 7.3ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:28` |
| 54.2% | 6.1ms | 0.0% | 0us | `tryIncrementalActiveBlockAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:131` |
| 43.6% | 4.9ms | 0.0% | 0us | `wouldIntroduceCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:163` |
| 43.6% | 4.9ms | 43.6% | 4.9ms | `endsWith` | `[native code]` |
| 34.0% | 3.8ms | 0.0% | 0us | `async (anonymous)` | `[native code]` |
| 12.2% | 1.3ms | 12.2% | 1.3ms | `parseModule` | `[native code]` |
| 11.4% | 1.3ms | 0.0% | 0us | `parseBlocks` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:21` |
| 11.4% | 1.3ms | 0.0% | 0us | `parseBlockAt` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:45` |
| 11.4% | 1.3ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:34` |
| 11.4% | 1.3ms | 0.0% | 0us | `rebuildLiveTree` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:75` |
| 11.4% | 1.3ms | 11.4% | 1.3ms | `parseHtmlBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts` |
| 11.0% | 1.2ms | 11.0% | 1.2ms | `push` | `[native code]` |
| 11.0% | 1.2ms | 0.0% | 0us | `tryIncrementalTableAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:348` |
| 10.9% | 1.2ms | 10.9% | 1.2ms | `fetch` | `[native code]` |
| 10.9% | 1.2ms | 0.0% | 0us | `(anonymous)` | `[native code]` |
| 10.9% | 1.2ms | 0.0% | 0us | `requestInstantiate` | `[native code]` |
| 10.9% | 1.2ms | 0.0% | 0us | `requestSatisfyUtil` | `[native code]` |
| 10.9% | 1.2ms | 0.0% | 0us | `requestFetch` | `[native code]` |
| 10.6% | 1.2ms | 10.6% | 1.2ms | `startsWith` | `[native code]` |

## Function Details

### `endsWith`
`[native code]` | Self: 43.6% (4.9ms) | Total: 43.6% (4.9ms) | Samples: 4

**Called by:**
- `wouldIntroduceCommitBoundary` (4)

### `parseModule`
`[native code]` | Self: 12.2% (1.3ms) | Total: 12.2% (1.3ms) | Samples: 1

**Called by:**
- `async (anonymous)` (1)

### `parseHtmlBlock`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts` | Self: 11.4% (1.3ms) | Total: 11.4% (1.3ms) | Samples: 1

**Called by:**
- `parseBlockAt` (1)

### `push`
`[native code]` | Self: 11.0% (1.2ms) | Total: 11.0% (1.2ms) | Samples: 1

**Called by:**
- `tryIncrementalTableAppend` (1)

### `fetch`
`[native code]` | Self: 10.9% (1.2ms) | Total: 10.9% (1.2ms) | Samples: 1

**Called by:**
- `requestFetch` (1)

### `startsWith`
`[native code]` | Self: 10.6% (1.2ms) | Total: 10.6% (1.2ms) | Samples: 1

**Called by:**
- `tryIncrementalActiveBlockAppend` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:34` | Self: 0.0% (0us) | Total: 11.4% (1.3ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `rebuildLiveTree` (1)

### `rebuildLiveTree`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:75` | Self: 0.0% (0us) | Total: 11.4% (1.3ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `parseBlocks` (1)

### `requestFetch`
`[native code]` | Self: 0.0% (0us) | Total: 10.9% (1.2ms) | Samples: 0

**Called by:**
- `async (anonymous)` (1)

**Calls:**
- `fetch` (1)

### `moduleEvaluation`
`[native code]` | Self: 0.0% (0us) | Total: 100.0% (17.3ms) | Samples: 0

**Called by:**
- `moduleEvaluation` (7)
- `async loadAndEvaluateModule` (7)

**Calls:**
- `moduleEvaluation` (7)
- `evaluate` (7)

### `requestSatisfyUtil`
`[native code]` | Self: 0.0% (0us) | Total: 10.9% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `requestInstantiate` (1)

### `parseBlockAt`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:45` | Self: 0.0% (0us) | Total: 11.4% (1.3ms) | Samples: 0

**Called by:**
- `parseBlocks` (1)

**Calls:**
- `parseHtmlBlock` (1)

### `wouldIntroduceCommitBoundary`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:163` | Self: 0.0% (0us) | Total: 43.6% (4.9ms) | Samples: 0

**Called by:**
- `tryIncrementalActiveBlockAppend` (4)

**Calls:**
- `endsWith` (4)

### `requestInstantiate`
`[native code]` | Self: 0.0% (0us) | Total: 10.9% (1.2ms) | Samples: 0

**Called by:**
- `requestSatisfyUtil` (1)

**Calls:**
- `async (anonymous)` (1)

### `(anonymous)`
`[native code]` | Self: 0.0% (0us) | Total: 10.9% (1.2ms) | Samples: 0

**Calls:**
- `requestSatisfyUtil` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:28` | Self: 0.0% (0us) | Total: 65.3% (7.3ms) | Samples: 0

**Called by:**
- `append` (6)

**Calls:**
- `tryIncrementalActiveBlockAppend` (5)
- `tryIncrementalTableAppend` (1)

### `tryIncrementalActiveBlockAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:131` | Self: 0.0% (0us) | Total: 54.2% (6.1ms) | Samples: 0

**Called by:**
- `append` (5)

**Calls:**
- `wouldIntroduceCommitBoundary` (4)
- `startsWith` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/StreamingParser.ts:12` | Self: 0.0% (0us) | Total: 76.8% (8.6ms) | Samples: 0

**Called by:**
- `(module)` (7)

**Calls:**
- `append` (6)
- `append` (1)

### `parseBlocks`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:21` | Self: 0.0% (0us) | Total: 11.4% (1.3ms) | Samples: 0

**Called by:**
- `rebuildLiveTree` (1)

**Calls:**
- `parseBlockAt` (1)

### `evaluate`
`[native code]` | Self: 0.0% (0us) | Total: 76.8% (8.6ms) | Samples: 0

**Called by:**
- `moduleEvaluation` (7)

**Calls:**
- `(module)` (7)

### `async (anonymous)`
`[native code]` | Self: 0.0% (0us) | Total: 34.0% (3.8ms) | Samples: 0

**Called by:**
- `async (anonymous)` (1)
- `requestInstantiate` (1)

**Calls:**
- `parseModule` (1)
- `async (anonymous)` (1)
- `requestFetch` (1)

### `async loadAndEvaluateModule`
`[native code]` | Self: 0.0% (0us) | Total: 76.8% (8.6ms) | Samples: 0

**Calls:**
- `moduleEvaluation` (7)

### `(module)`
`/Users/koen/Documents/MarkdownParser/[eval]:1` | Self: 0.0% (0us) | Total: 76.8% (8.6ms) | Samples: 0

**Called by:**
- `evaluate` (7)

**Calls:**
- `append` (7)

### `tryIncrementalTableAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:348` | Self: 0.0% (0us) | Total: 11.0% (1.2ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `push` (1)

## Files

| Self% | Self | File |
|------:|-----:|------|
| 88.5% | 10.0ms | `[native code]` |
| 11.4% | 1.3ms | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts` |
