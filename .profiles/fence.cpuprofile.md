# CPU Profile

| Duration | Samples | Interval | Functions |
|----------|---------|----------|----------|
| 604.4ms | 475 | 1.0ms | 33 |

**Top 10:** `RegExp` 37.4%, `stringSplitFast` 28.6%, `startsWith` 15.2%, `hasClosingFence` 12.5%, `endsWith` 2.1%, ``/^\`{3,}\s*$/`` 1.6%, `hasClosingFence` 1.4%, `parseModule` 0.5%, `regExpMatchFast` 0.1%

## Hot Functions (Self Time)

| Self% | Self | Total% | Total | Function | Location |
|------:|-----:|-------:|------:|----------|----------|
| 37.4% | 226.0ms | 37.4% | 226.0ms | `RegExp` | `[native code]` |
| 28.6% | 173.2ms | 28.6% | 173.2ms | `stringSplitFast` | `[native code]` |
| 15.2% | 92.2ms | 15.2% | 92.2ms | `startsWith` | `[native code]` |
| 12.5% | 75.9ms | 51.2% | 309.7ms | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:200` |
| 2.1% | 13.0ms | 2.1% | 13.0ms | `endsWith` | `[native code]` |
| 1.6% | 10.2ms | 1.6% | 10.2ms | ``/^\`{3,}\s*$/`` | `[native code]` |
| 1.4% | 8.7ms | 16.7% | 100.9ms | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:199` |
| 0.5% | 3.5ms | 0.5% | 3.5ms | `parseModule` | `[native code]` |
| 0.1% | 1.1ms | 0.1% | 1.1ms | `regExpMatchFast` | `[native code]` |

## Call Tree (Total Time)

| Total% | Total | Self% | Self | Function | Location |
|-------:|------:|------:|-----:|----------|----------|
| 100.0% | 1.20s | 0.0% | 0us | `moduleEvaluation` | `[native code]` |
| 99.4% | 600.6ms | 0.0% | 0us | `(module)` | `/Users/koen/Documents/MarkdownParser/[eval]:1` |
| 99.4% | 600.6ms | 0.0% | 0us | `async loadAndEvaluateModule` | `[native code]` |
| 99.4% | 600.6ms | 0.0% | 0us | `evaluate` | `[native code]` |
| 99.4% | 600.6ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/StreamingParser.ts:12` |
| 98.8% | 597.0ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:28` |
| 96.6% | 583.9ms | 0.0% | 0us | `tryIncrementalCodeBlockAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:182` |
| 51.2% | 309.7ms | 12.5% | 75.9ms | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:200` |
| 37.4% | 226.0ms | 37.4% | 226.0ms | `RegExp` | `[native code]` |
| 28.6% | 173.2ms | 28.6% | 173.2ms | `stringSplitFast` | `[native code]` |
| 28.6% | 173.2ms | 0.0% | 0us | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:196` |
| 16.7% | 100.9ms | 1.4% | 8.7ms | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:199` |
| 15.2% | 92.2ms | 15.2% | 92.2ms | `startsWith` | `[native code]` |
| 2.1% | 13.0ms | 0.0% | 0us | `wouldIntroduceCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:163` |
| 2.1% | 13.0ms | 0.0% | 0us | `tryIncrementalActiveBlockAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:131` |
| 2.1% | 13.0ms | 2.1% | 13.0ms | `endsWith` | `[native code]` |
| 1.6% | 10.2ms | 1.6% | 10.2ms | ``/^\`{3,}\s*$/`` | `[native code]` |
| 0.5% | 3.5ms | 0.0% | 0us | `async (anonymous)` | `[native code]` |
| 0.5% | 3.5ms | 0.5% | 3.5ms | `parseModule` | `[native code]` |
| 0.3% | 2.1ms | 0.0% | 0us | `parseBlocks` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:21` |
| 0.3% | 2.1ms | 0.0% | 0us | `rebuildLiveTree` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:75` |
| 0.3% | 2.1ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:34` |
| 0.2% | 1.4ms | 0.0% | 0us | `isFenceCloseLine` | `/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:71` |
| 0.2% | 1.4ms | 0.0% | 0us | `updateFenceState` | `/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:53` |
| 0.2% | 1.4ms | 0.0% | 0us | `findNextCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:17` |
| 0.2% | 1.4ms | 0.0% | 0us | `consumeCommittedBlocks` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:47` |
| 0.2% | 1.4ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:33` |
| 0.1% | 1.1ms | 0.1% | 1.1ms | `regExpMatchFast` | `[native code]` |
| 0.1% | 1.1ms | 0.0% | 0us | `parseBlockAt` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:32` |
| 0.1% | 1.1ms | 0.0% | 0us | `parseReferenceDefinitionLine` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:192` |
| 0.1% | 1.0ms | 0.0% | 0us | `parseFencedCodeBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:290` |
| 0.1% | 1.0ms | 0.0% | 0us | `parseBlockAt` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:58` |
| 0.1% | 1.0ms | 0.0% | 0us | `isFenceCloseLine` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:351` |

## Function Details

### `RegExp`
`[native code]` | Self: 37.4% (226.0ms) | Total: 37.4% (226.0ms) | Samples: 179

**Called by:**
- `hasClosingFence` (177)
- `isFenceCloseLine` (1)
- `isFenceCloseLine` (1)

### `stringSplitFast`
`[native code]` | Self: 28.6% (173.2ms) | Total: 28.6% (173.2ms) | Samples: 135

**Called by:**
- `hasClosingFence` (135)

### `startsWith`
`[native code]` | Self: 15.2% (92.2ms) | Total: 15.2% (92.2ms) | Samples: 73

**Called by:**
- `hasClosingFence` (73)

### `hasClosingFence`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:200` | Self: 12.5% (75.9ms) | Total: 51.2% (309.7ms) | Samples: 60

**Called by:**
- `tryIncrementalCodeBlockAppend` (245)

**Calls:**
- `RegExp` (177)
- ``/^\`{3,}\s*$/`` (8)

### `endsWith`
`[native code]` | Self: 2.1% (13.0ms) | Total: 2.1% (13.0ms) | Samples: 10

**Called by:**
- `wouldIntroduceCommitBoundary` (10)

### ``/^\`{3,}\s*$/``
`[native code]` | Self: 1.6% (10.2ms) | Total: 1.6% (10.2ms) | Samples: 8

**Called by:**
- `hasClosingFence` (8)

### `hasClosingFence`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:199` | Self: 1.4% (8.7ms) | Total: 16.7% (100.9ms) | Samples: 7

**Called by:**
- `tryIncrementalCodeBlockAppend` (80)

**Calls:**
- `startsWith` (73)

### `parseModule`
`[native code]` | Self: 0.5% (3.5ms) | Total: 0.5% (3.5ms) | Samples: 2

**Called by:**
- `async (anonymous)` (2)

### `regExpMatchFast`
`[native code]` | Self: 0.1% (1.1ms) | Total: 0.1% (1.1ms) | Samples: 1

**Called by:**
- `parseReferenceDefinitionLine` (1)

### `parseBlockAt`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:32` | Self: 0.0% (0us) | Total: 0.1% (1.1ms) | Samples: 0

**Called by:**
- `parseBlocks` (1)

**Calls:**
- `parseReferenceDefinitionLine` (1)

### `rebuildLiveTree`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:75` | Self: 0.0% (0us) | Total: 0.3% (2.1ms) | Samples: 0

**Called by:**
- `append` (2)

**Calls:**
- `parseBlocks` (2)

### `isFenceCloseLine`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:351` | Self: 0.0% (0us) | Total: 0.1% (1.0ms) | Samples: 0

**Called by:**
- `parseFencedCodeBlock` (1)

**Calls:**
- `RegExp` (1)

### `hasClosingFence`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:196` | Self: 0.0% (0us) | Total: 28.6% (173.2ms) | Samples: 0

**Called by:**
- `tryIncrementalCodeBlockAppend` (135)

**Calls:**
- `stringSplitFast` (135)

### `parseBlockAt`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:58` | Self: 0.0% (0us) | Total: 0.1% (1.0ms) | Samples: 0

**Called by:**
- `parseBlocks` (1)

**Calls:**
- `parseFencedCodeBlock` (1)

### `parseFencedCodeBlock`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:290` | Self: 0.0% (0us) | Total: 0.1% (1.0ms) | Samples: 0

**Called by:**
- `parseBlockAt` (1)

**Calls:**
- `isFenceCloseLine` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:34` | Self: 0.0% (0us) | Total: 0.3% (2.1ms) | Samples: 0

**Called by:**
- `append` (2)

**Calls:**
- `rebuildLiveTree` (2)

### `tryIncrementalCodeBlockAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:182` | Self: 0.0% (0us) | Total: 96.6% (583.9ms) | Samples: 0

**Called by:**
- `append` (460)

**Calls:**
- `hasClosingFence` (245)
- `hasClosingFence` (135)
- `hasClosingFence` (80)

### `isFenceCloseLine`
`/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:71` | Self: 0.0% (0us) | Total: 0.2% (1.4ms) | Samples: 0

**Called by:**
- `updateFenceState` (1)

**Calls:**
- `RegExp` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/StreamingParser.ts:12` | Self: 0.0% (0us) | Total: 99.4% (600.6ms) | Samples: 0

**Called by:**
- `(module)` (473)

**Calls:**
- `append` (470)
- `append` (2)
- `append` (1)

### `updateFenceState`
`/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:53` | Self: 0.0% (0us) | Total: 0.2% (1.4ms) | Samples: 0

**Called by:**
- `findNextCommitBoundary` (1)

**Calls:**
- `isFenceCloseLine` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:28` | Self: 0.0% (0us) | Total: 98.8% (597.0ms) | Samples: 0

**Called by:**
- `append` (470)

**Calls:**
- `tryIncrementalCodeBlockAppend` (460)
- `tryIncrementalActiveBlockAppend` (10)

### `tryIncrementalActiveBlockAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:131` | Self: 0.0% (0us) | Total: 2.1% (13.0ms) | Samples: 0

**Called by:**
- `append` (10)

**Calls:**
- `wouldIntroduceCommitBoundary` (10)

### `parseBlocks`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:21` | Self: 0.0% (0us) | Total: 0.3% (2.1ms) | Samples: 0

**Called by:**
- `rebuildLiveTree` (2)

**Calls:**
- `parseBlockAt` (1)
- `parseBlockAt` (1)

### `findNextCommitBoundary`
`/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:17` | Self: 0.0% (0us) | Total: 0.2% (1.4ms) | Samples: 0

**Called by:**
- `consumeCommittedBlocks` (1)

**Calls:**
- `updateFenceState` (1)

### `consumeCommittedBlocks`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:47` | Self: 0.0% (0us) | Total: 0.2% (1.4ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `findNextCommitBoundary` (1)

### `moduleEvaluation`
`[native code]` | Self: 0.0% (0us) | Total: 100.0% (1.20s) | Samples: 0

**Called by:**
- `moduleEvaluation` (473)
- `async loadAndEvaluateModule` (473)

**Calls:**
- `moduleEvaluation` (473)
- `evaluate` (473)

### `evaluate`
`[native code]` | Self: 0.0% (0us) | Total: 99.4% (600.6ms) | Samples: 0

**Called by:**
- `moduleEvaluation` (473)

**Calls:**
- `(module)` (473)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:33` | Self: 0.0% (0us) | Total: 0.2% (1.4ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `consumeCommittedBlocks` (1)

### `parseReferenceDefinitionLine`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:192` | Self: 0.0% (0us) | Total: 0.1% (1.1ms) | Samples: 0

**Called by:**
- `parseBlockAt` (1)

**Calls:**
- `regExpMatchFast` (1)

### `async loadAndEvaluateModule`
`[native code]` | Self: 0.0% (0us) | Total: 99.4% (600.6ms) | Samples: 0

**Calls:**
- `moduleEvaluation` (473)

### `async (anonymous)`
`[native code]` | Self: 0.0% (0us) | Total: 0.5% (3.5ms) | Samples: 0

**Calls:**
- `parseModule` (2)

### `(module)`
`/Users/koen/Documents/MarkdownParser/[eval]:1` | Self: 0.0% (0us) | Total: 99.4% (600.6ms) | Samples: 0

**Called by:**
- `evaluate` (473)

**Calls:**
- `append` (473)

### `wouldIntroduceCommitBoundary`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:163` | Self: 0.0% (0us) | Total: 2.1% (13.0ms) | Samples: 0

**Called by:**
- `tryIncrementalActiveBlockAppend` (10)

**Calls:**
- `endsWith` (10)

## Files

| Self% | Self | File |
|------:|-----:|------|
| 85.9% | 519.5ms | `[native code]` |
| 14.0% | 84.6ms | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts` |
