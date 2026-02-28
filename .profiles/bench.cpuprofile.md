# CPU Profile

| Duration | Samples | Interval | Functions |
|----------|---------|----------|----------|
| 793.9ms | 619 | 1.0ms | 96 |

**Top 10:** `RegExp` 32.5%, `stringSplitFast` 23.9%, `hasClosingFence` 14.5%, `startsWith` 14.0%, `endsWith` 3.2%, `/(?:^\|\n)(#{1,6})$/` 1.7%, ``/^\`{3,}\s*$/`` 1.6%, `hasClosingFence` 1.2%, `tryIncrementalListAppend` 0.9%, `[Symbol.match]` 0.8%

## Hot Functions (Self Time)

| Self% | Self | Total% | Total | Function | Location |
|------:|-----:|-------:|------:|----------|----------|
| 32.5% | 258.0ms | 32.5% | 258.0ms | `RegExp` | `[native code]` |
| 23.9% | 190.1ms | 23.9% | 190.1ms | `stringSplitFast` | `[native code]` |
| 14.5% | 115.1ms | 48.6% | 386.0ms | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:200` |
| 14.0% | 111.3ms | 14.0% | 111.3ms | `startsWith` | `[native code]` |
| 3.2% | 25.7ms | 3.2% | 25.7ms | `endsWith` | `[native code]` |
| 1.7% | 13.5ms | 1.7% | 13.5ms | `/(?:^\|\n)(#{1,6})$/` | `[native code]` |
| 1.6% | 12.8ms | 1.6% | 12.8ms | ``/^\`{3,}\s*$/`` | `[native code]` |
| 1.2% | 10.2ms | 15.1% | 120.2ms | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:199` |
| 0.9% | 7.6ms | 0.9% | 7.6ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:214` |
| 0.8% | 6.4ms | 2.5% | 20.0ms | `[Symbol.match]` | `[native code]` |
| 0.4% | 3.8ms | 32.3% | 256.8ms | `map` | `[native code]` |
| 0.3% | 2.8ms | 0.3% | 2.8ms | `parseInline` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts` |
| 0.3% | 2.6ms | 0.3% | 2.6ms | `slice` | `[native code]` |
| 0.3% | 2.5ms | 0.3% | 2.5ms | `moduleDeclarationInstantiation` | `[native code]` |
| 0.1% | 1.5ms | 0.1% | 1.5ms | `parseModule` | `[native code]` |
| 0.1% | 1.5ms | 0.1% | 1.5ms | `buildBlockquoteBoundaryMap` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:732` |
| 0.1% | 1.4ms | 0.1% | 1.4ms | `isFenceCloseLine` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:351` |
| 0.1% | 1.4ms | 0.1% | 1.4ms | `buildBlockquoteBoundaryMap` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:726` |
| 0.1% | 1.3ms | 0.3% | 2.7ms | `parseOptimisticCodeSpanAt` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:360` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `findNextCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:12` |
| 0.1% | 1.3ms | 0.3% | 2.5ms | `isFastPathChunk` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:124` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:49` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `copyDataProperties` | `[native code]` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:28` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `tryFastPlainTextAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:116` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `tryFastPlainTextAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:97` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `tryIncrementalTableAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:348` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `parseTableRowLine` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `wouldIntroduceCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:160` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:218` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `cloneObject` | `[native code]` |
| 0.1% | 1.1ms | 0.1% | 1.1ms | ``/[\\`\n\[\]!<*_\#]/`` | `[native code]` |
| 0.1% | 1.1ms | 0.1% | 1.1ms | `parseSimpleListMarker` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:288` |
| 0.1% | 1.1ms | 0.1% | 1.1ms | `split` | `[native code]` |
| 0.1% | 1.0ms | 0.1% | 1.0ms | `join` | `[native code]` |
| 0.1% | 1.0ms | 0.1% | 1.0ms | `buildBlockquoteBoundaryMap` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:719` |
| 0.1% | 1.0ms | 0.1% | 1.0ms | `tryIncrementalCodeBlockAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:170` |
| 0.1% | 896us | 0.1% | 896us | `endsWithUnescapedSingleMarker` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:591` |

## Call Tree (Total Time)

| Total% | Total | Self% | Self | Function | Location |
|-------:|------:|------:|-----:|----------|----------|
| 100.0% | 1.57s | 0.0% | 0us | `moduleEvaluation` | `[native code]` |
| 99.6% | 790.7ms | 0.0% | 0us | `async loadAndEvaluateModule` | `[native code]` |
| 99.3% | 788.2ms | 0.0% | 0us | `(module)` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:74` |
| 99.3% | 788.2ms | 0.0% | 0us | `runScenario` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:69` |
| 99.3% | 788.2ms | 0.0% | 0us | `evaluate` | `[native code]` |
| 98.9% | 785.5ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/StreamingParser.ts:12` |
| 93.8% | 744.7ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:28` |
| 90.0% | 714.6ms | 0.0% | 0us | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:39` |
| 87.7% | 696.4ms | 0.0% | 0us | `tryIncrementalCodeBlockAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:182` |
| 49.1% | 389.9ms | 0.0% | 0us | `parseBlocks` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:21` |
| 48.6% | 386.0ms | 14.5% | 115.1ms | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:200` |
| 48.3% | 383.3ms | 0.0% | 0us | `parseBlockAt` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:66` |
| 47.3% | 375.5ms | 0.0% | 0us | `parseBlockquoteBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:678` |
| 32.5% | 258.0ms | 32.5% | 258.0ms | `RegExp` | `[native code]` |
| 32.3% | 256.8ms | 0.4% | 3.8ms | `map` | `[native code]` |
| 31.7% | 251.7ms | 0.0% | 0us | `remapNodePositions` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:748` |
| 23.9% | 190.1ms | 0.0% | 0us | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:196` |
| 23.9% | 190.1ms | 23.9% | 190.1ms | `stringSplitFast` | `[native code]` |
| 15.1% | 120.2ms | 1.2% | 10.2ms | `hasClosingFence` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:199` |
| 14.0% | 111.3ms | 14.0% | 111.3ms | `startsWith` | `[native code]` |
| 3.5% | 28.4ms | 0.0% | 0us | `tryIncrementalActiveBlockAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:131` |
| 3.2% | 25.7ms | 0.0% | 0us | `wouldIntroduceCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:163` |
| 3.2% | 25.7ms | 3.2% | 25.7ms | `endsWith` | `[native code]` |
| 3.1% | 25.1ms | 0.0% | 0us | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:27` |
| 3.1% | 25.0ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:24` |
| 3.0% | 24.0ms | 0.0% | 0us | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:19` |
| 3.0% | 24.0ms | 0.0% | 0us | `appendCharByChar` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:5` |
| 2.5% | 20.0ms | 0.0% | 0us | `match` | `[native code]` |
| 2.5% | 20.0ms | 0.8% | 6.4ms | `[Symbol.match]` | `[native code]` |
| 2.5% | 19.8ms | 0.0% | 0us | `tryFastPlainTextAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:94` |
| 2.3% | 18.9ms | 0.0% | 0us | `getPendingSuffixLength` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:36` |
| 1.8% | 14.3ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:34` |
| 1.8% | 14.3ms | 0.0% | 0us | `rebuildLiveTree` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:75` |
| 1.7% | 13.5ms | 1.7% | 13.5ms | `/(?:^\|\n)(#{1,6})$/` | `[native code]` |
| 1.6% | 12.8ms | 1.6% | 12.8ms | ``/^\`{3,}\s*$/`` | `[native code]` |
| 1.5% | 12.6ms | 0.0% | 0us | `link` | `[native code]` |
| 1.1% | 9.0ms | 0.0% | 0us | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:62` |
| 1.0% | 8.6ms | 0.0% | 0us | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:50` |
| 0.9% | 7.6ms | 0.9% | 7.6ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:214` |
| 0.5% | 4.1ms | 0.0% | 0us | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:251` |
| 0.4% | 3.9ms | 0.0% | 0us | `parseBlockquoteBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:670` |
| 0.4% | 3.8ms | 0.0% | 0us | `parseBlockquoteBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:681` |
| 0.3% | 2.8ms | 0.3% | 2.8ms | `parseInline` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts` |
| 0.3% | 2.8ms | 0.0% | 0us | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:41` |
| 0.3% | 2.7ms | 0.1% | 1.3ms | `parseOptimisticCodeSpanAt` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:360` |
| 0.3% | 2.7ms | 0.0% | 0us | `parseInline` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:168` |
| 0.3% | 2.6ms | 0.3% | 2.6ms | `slice` | `[native code]` |
| 0.3% | 2.5ms | 0.1% | 1.3ms | `isFastPathChunk` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:124` |
| 0.3% | 2.5ms | 0.0% | 0us | `tryFastPlainTextAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:86` |
| 0.3% | 2.5ms | 0.0% | 0us | `linkAndEvaluateModule` | `[native code]` |
| 0.3% | 2.5ms | 0.3% | 2.5ms | `moduleDeclarationInstantiation` | `[native code]` |
| 0.3% | 2.4ms | 0.0% | 0us | `parseListBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:779` |
| 0.3% | 2.4ms | 0.0% | 0us | `parseBlockAt` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:74` |
| 0.1% | 1.5ms | 0.0% | 0us | `async (anonymous)` | `[native code]` |
| 0.1% | 1.5ms | 0.1% | 1.5ms | `parseModule` | `[native code]` |
| 0.1% | 1.5ms | 0.1% | 1.5ms | `buildBlockquoteBoundaryMap` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:732` |
| 0.1% | 1.5ms | 0.0% | 0us | `parseParagraph` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:136` |
| 0.1% | 1.4ms | 0.1% | 1.4ms | `isFenceCloseLine` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:351` |
| 0.1% | 1.4ms | 0.0% | 0us | `parseFencedCodeBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:290` |
| 0.1% | 1.4ms | 0.0% | 0us | `parseBlockAt` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:58` |
| 0.1% | 1.4ms | 0.1% | 1.4ms | `buildBlockquoteBoundaryMap` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:726` |
| 0.1% | 1.3ms | 0.0% | 0us | `append` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:33` |
| 0.1% | 1.3ms | 0.0% | 0us | `consumeCommittedBlocks` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:47` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `findNextCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:12` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:49` |
| 0.1% | 1.3ms | 0.0% | 0us | `parseListAtIndent` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:938` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `copyDataProperties` | `[native code]` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:28` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `tryFastPlainTextAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:97` |
| 0.1% | 1.3ms | 0.1% | 1.3ms | `tryFastPlainTextAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:116` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `tryIncrementalTableAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:348` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `parseTableRowLine` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts` |
| 0.1% | 1.2ms | 0.0% | 0us | `parseTableBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:427` |
| 0.1% | 1.2ms | 0.0% | 0us | `run` | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:48` |
| 0.1% | 1.2ms | 0.0% | 0us | `parseBlockAt` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:82` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `wouldIntroduceCommitBoundary` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:160` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:218` |
| 0.1% | 1.2ms | 0.1% | 1.2ms | `cloneObject` | `[native code]` |
| 0.1% | 1.2ms | 0.0% | 0us | `remapNodePositions` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:752` |
| 0.1% | 1.2ms | 0.0% | 0us | `parseBlockAt` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:32` |
| 0.1% | 1.2ms | 0.0% | 0us | `parseReferenceDefinitionLine` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:191` |
| 0.1% | 1.2ms | 0.0% | 0us | `parseTableBodyRow` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:364` |
| 0.1% | 1.2ms | 0.0% | 0us | `tryIncrementalTableAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:336` |
| 0.1% | 1.1ms | 0.1% | 1.1ms | ``/[\\`\n\[\]!<*_\#]/`` | `[native code]` |
| 0.1% | 1.1ms | 0.0% | 0us | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:238` |
| 0.1% | 1.1ms | 0.1% | 1.1ms | `parseSimpleListMarker` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:288` |
| 0.1% | 1.1ms | 0.1% | 1.1ms | `split` | `[native code]` |
| 0.1% | 1.1ms | 0.0% | 0us | `tryIncrementalListAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:229` |
| 0.1% | 1.1ms | 0.0% | 0us | `tryIncrementalCodeBlockAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:173` |
| 0.1% | 1.0ms | 0.1% | 1.0ms | `join` | `[native code]` |
| 0.1% | 1.0ms | 0.0% | 0us | `parseListAtIndent` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:858` |
| 0.1% | 1.0ms | 0.0% | 0us | `parseStrippedBlock` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:1017` |
| 0.1% | 1.0ms | 0.1% | 1.0ms | `buildBlockquoteBoundaryMap` | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:719` |
| 0.1% | 1.0ms | 0.1% | 1.0ms | `tryIncrementalCodeBlockAppend` | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:170` |
| 0.1% | 896us | 0.0% | 0us | `getPendingSuffixLength` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:41` |
| 0.1% | 896us | 0.1% | 896us | `endsWithUnescapedSingleMarker` | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:591` |

## Function Details

### `RegExp`
`[native code]` | Self: 32.5% (258.0ms) | Total: 32.5% (258.0ms) | Samples: 200

**Called by:**
- `hasClosingFence` (200)

### `stringSplitFast`
`[native code]` | Self: 23.9% (190.1ms) | Total: 23.9% (190.1ms) | Samples: 150

**Called by:**
- `hasClosingFence` (150)

### `hasClosingFence`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:200` | Self: 14.5% (115.1ms) | Total: 48.6% (386.0ms) | Samples: 90

**Called by:**
- `tryIncrementalCodeBlockAppend` (300)

**Calls:**
- `RegExp` (200)
- ``/^\`{3,}\s*$/`` (10)

### `startsWith`
`[native code]` | Self: 14.0% (111.3ms) | Total: 14.0% (111.3ms) | Samples: 87

**Called by:**
- `hasClosingFence` (86)
- `tryIncrementalActiveBlockAppend` (1)

### `endsWith`
`[native code]` | Self: 3.2% (25.7ms) | Total: 3.2% (25.7ms) | Samples: 20

**Called by:**
- `wouldIntroduceCommitBoundary` (20)

### `/(?:^\|\n)(#{1,6})$/`
`[native code]` | Self: 1.7% (13.5ms) | Total: 1.7% (13.5ms) | Samples: 11

**Called by:**
- `[Symbol.match]` (11)

### ``/^\`{3,}\s*$/``
`[native code]` | Self: 1.6% (12.8ms) | Total: 1.6% (12.8ms) | Samples: 10

**Called by:**
- `hasClosingFence` (10)

### `hasClosingFence`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:199` | Self: 1.2% (10.2ms) | Total: 15.1% (120.2ms) | Samples: 8

**Called by:**
- `tryIncrementalCodeBlockAppend` (94)

**Calls:**
- `startsWith` (86)

### `tryIncrementalListAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:214` | Self: 0.9% (7.6ms) | Total: 0.9% (7.6ms) | Samples: 6

**Called by:**
- `append` (6)

### `[Symbol.match]`
`[native code]` | Self: 0.8% (6.4ms) | Total: 2.5% (20.0ms) | Samples: 5

**Called by:**
- `match` (16)

**Calls:**
- `/(?:^\|\n)(#{1,6})$/` (11)

### `map`
`[native code]` | Self: 0.4% (3.8ms) | Total: 32.3% (256.8ms) | Samples: 3

**Called by:**
- `remapNodePositions` (184)
- `parseBlockquoteBlock` (3)
- `parseTableBodyRow` (1)

**Calls:**
- `remapNodePositions` (184)
- `remapNodePositions` (1)

### `parseInline`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts` | Self: 0.3% (2.8ms) | Total: 0.3% (2.8ms) | Samples: 2

**Called by:**
- `parseParagraph` (1)
- `tryIncrementalListAppend` (1)

### `slice`
`[native code]` | Self: 0.3% (2.6ms) | Total: 0.3% (2.6ms) | Samples: 2

**Called by:**
- `parseReferenceDefinitionLine` (1)
- `parseOptimisticCodeSpanAt` (1)

### `moduleDeclarationInstantiation`
`[native code]` | Self: 0.3% (2.5ms) | Total: 0.3% (2.5ms) | Samples: 1

**Called by:**
- `link` (1)

### `parseModule`
`[native code]` | Self: 0.1% (1.5ms) | Total: 0.1% (1.5ms) | Samples: 1

**Called by:**
- `async (anonymous)` (1)

### `buildBlockquoteBoundaryMap`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:732` | Self: 0.1% (1.5ms) | Total: 0.1% (1.5ms) | Samples: 1

**Called by:**
- `parseBlockquoteBlock` (1)

### `isFenceCloseLine`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:351` | Self: 0.1% (1.4ms) | Total: 0.1% (1.4ms) | Samples: 1

**Called by:**
- `parseFencedCodeBlock` (1)

### `buildBlockquoteBoundaryMap`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:726` | Self: 0.1% (1.4ms) | Total: 0.1% (1.4ms) | Samples: 1

**Called by:**
- `parseBlockquoteBlock` (1)

### `parseOptimisticCodeSpanAt`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:360` | Self: 0.1% (1.3ms) | Total: 0.3% (2.7ms) | Samples: 1

**Called by:**
- `parseInline` (2)

**Calls:**
- `slice` (1)

### `findNextCommitBoundary`
`/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts:12` | Self: 0.1% (1.3ms) | Total: 0.1% (1.3ms) | Samples: 1

**Called by:**
- `consumeCommittedBlocks` (1)

### `isFastPathChunk`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:124` | Self: 0.1% (1.3ms) | Total: 0.3% (2.5ms) | Samples: 1

**Called by:**
- `tryFastPlainTextAppend` (2)

**Calls:**
- ``/[\\`\n\[\]!<*_\#]/`` (1)

### `run`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:49` | Self: 0.1% (1.3ms) | Total: 0.1% (1.3ms) | Samples: 1

**Called by:**
- `runScenario` (1)

### `copyDataProperties`
`[native code]` | Self: 0.1% (1.3ms) | Total: 0.1% (1.3ms) | Samples: 1

**Called by:**
- `parseListAtIndent` (1)

### `run`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:28` | Self: 0.1% (1.3ms) | Total: 0.1% (1.3ms) | Samples: 1

**Called by:**
- `runScenario` (1)

### `tryFastPlainTextAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:116` | Self: 0.1% (1.3ms) | Total: 0.1% (1.3ms) | Samples: 1

**Called by:**
- `append` (1)

### `tryFastPlainTextAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:97` | Self: 0.1% (1.3ms) | Total: 0.1% (1.3ms) | Samples: 1

**Called by:**
- `append` (1)

### `tryIncrementalTableAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:348` | Self: 0.1% (1.2ms) | Total: 0.1% (1.2ms) | Samples: 1

**Called by:**
- `append` (1)

### `parseTableRowLine`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts` | Self: 0.1% (1.2ms) | Total: 0.1% (1.2ms) | Samples: 1

**Called by:**
- `parseTableBlock` (1)

### `wouldIntroduceCommitBoundary`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:160` | Self: 0.1% (1.2ms) | Total: 0.1% (1.2ms) | Samples: 1

**Called by:**
- `tryIncrementalActiveBlockAppend` (1)

### `tryIncrementalListAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:218` | Self: 0.1% (1.2ms) | Total: 0.1% (1.2ms) | Samples: 1

**Called by:**
- `append` (1)

### `cloneObject`
`[native code]` | Self: 0.1% (1.2ms) | Total: 0.1% (1.2ms) | Samples: 1

**Called by:**
- `remapNodePositions` (1)

### ``/[\\`\n\[\]!<*_\#]/``
`[native code]` | Self: 0.1% (1.1ms) | Total: 0.1% (1.1ms) | Samples: 1

**Called by:**
- `isFastPathChunk` (1)

### `parseSimpleListMarker`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:288` | Self: 0.1% (1.1ms) | Total: 0.1% (1.1ms) | Samples: 1

**Called by:**
- `tryIncrementalListAppend` (1)

### `split`
`[native code]` | Self: 0.1% (1.1ms) | Total: 0.1% (1.1ms) | Samples: 1

**Called by:**
- `tryIncrementalListAppend` (1)

### `join`
`[native code]` | Self: 0.1% (1.0ms) | Total: 0.1% (1.0ms) | Samples: 1

**Called by:**
- `parseStrippedBlock` (1)

### `buildBlockquoteBoundaryMap`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:719` | Self: 0.1% (1.0ms) | Total: 0.1% (1.0ms) | Samples: 1

**Called by:**
- `parseBlockquoteBlock` (1)

### `tryIncrementalCodeBlockAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:170` | Self: 0.1% (1.0ms) | Total: 0.1% (1.0ms) | Samples: 1

**Called by:**
- `append` (1)

### `endsWithUnescapedSingleMarker`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:591` | Self: 0.1% (896us) | Total: 0.1% (896us) | Samples: 1

**Called by:**
- `getPendingSuffixLength` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:24` | Self: 0.0% (0us) | Total: 3.1% (25.0ms) | Samples: 0

**Called by:**
- `append` (20)

**Calls:**
- `tryFastPlainTextAppend` (16)
- `tryFastPlainTextAppend` (2)
- `tryFastPlainTextAppend` (1)
- `tryFastPlainTextAppend` (1)

### `async loadAndEvaluateModule`
`[native code]` | Self: 0.0% (0us) | Total: 99.6% (790.7ms) | Samples: 0

**Calls:**
- `moduleEvaluation` (616)
- `linkAndEvaluateModule` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:28` | Self: 0.0% (0us) | Total: 93.8% (744.7ms) | Samples: 0

**Called by:**
- `append` (582)

**Calls:**
- `tryIncrementalCodeBlockAppend` (544)
- `tryIncrementalActiveBlockAppend` (22)
- `tryIncrementalListAppend` (6)
- `tryIncrementalListAppend` (3)
- `tryIncrementalListAppend` (1)
- `tryIncrementalCodeBlockAppend` (1)
- `tryIncrementalTableAppend` (1)
- `tryIncrementalListAppend` (1)
- `tryIncrementalCodeBlockAppend` (1)
- `tryIncrementalListAppend` (1)
- `tryIncrementalTableAppend` (1)

### `tryIncrementalListAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:238` | Self: 0.0% (0us) | Total: 0.1% (1.1ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `parseSimpleListMarker` (1)

### `consumeCommittedBlocks`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:47` | Self: 0.0% (0us) | Total: 0.1% (1.3ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `findNextCommitBoundary` (1)

### `parseTableBodyRow`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:364` | Self: 0.0% (0us) | Total: 0.1% (1.2ms) | Samples: 0

**Called by:**
- `tryIncrementalTableAppend` (1)

**Calls:**
- `map` (1)

### `evaluate`
`[native code]` | Self: 0.0% (0us) | Total: 99.3% (788.2ms) | Samples: 0

**Called by:**
- `moduleEvaluation` (616)

**Calls:**
- `(module)` (616)

### `async (anonymous)`
`[native code]` | Self: 0.0% (0us) | Total: 0.1% (1.5ms) | Samples: 0

**Calls:**
- `parseModule` (1)

### `link`
`[native code]` | Self: 0.0% (0us) | Total: 1.5% (12.6ms) | Samples: 0

**Called by:**
- `link` (4)
- `linkAndEvaluateModule` (1)

**Calls:**
- `link` (4)
- `moduleDeclarationInstantiation` (1)

### `tryFastPlainTextAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:94` | Self: 0.0% (0us) | Total: 2.5% (19.8ms) | Samples: 0

**Called by:**
- `append` (16)

**Calls:**
- `getPendingSuffixLength` (15)
- `getPendingSuffixLength` (1)

### `match`
`[native code]` | Self: 0.0% (0us) | Total: 2.5% (20.0ms) | Samples: 0

**Called by:**
- `getPendingSuffixLength` (15)
- `tryIncrementalCodeBlockAppend` (1)

**Calls:**
- `[Symbol.match]` (16)

### `parseTableBlock`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:427` | Self: 0.0% (0us) | Total: 0.1% (1.2ms) | Samples: 0

**Called by:**
- `parseBlockAt` (1)

**Calls:**
- `parseTableRowLine` (1)

### `parseListAtIndent`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:938` | Self: 0.0% (0us) | Total: 0.1% (1.3ms) | Samples: 0

**Called by:**
- `parseListBlock` (1)

**Calls:**
- `copyDataProperties` (1)

### `parseFencedCodeBlock`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:290` | Self: 0.0% (0us) | Total: 0.1% (1.4ms) | Samples: 0

**Called by:**
- `parseBlockAt` (1)

**Calls:**
- `isFenceCloseLine` (1)

### `run`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:41` | Self: 0.0% (0us) | Total: 0.3% (2.8ms) | Samples: 0

**Called by:**
- `runScenario` (2)

**Calls:**
- `append` (2)

### `tryFastPlainTextAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:86` | Self: 0.0% (0us) | Total: 0.3% (2.5ms) | Samples: 0

**Called by:**
- `append` (2)

**Calls:**
- `isFastPathChunk` (2)

### `parseBlockquoteBlock`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:678` | Self: 0.0% (0us) | Total: 47.3% (375.5ms) | Samples: 0

**Called by:**
- `parseBlockAt` (293)

**Calls:**
- `parseBlocks` (293)

### `(module)`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:74` | Self: 0.0% (0us) | Total: 99.3% (788.2ms) | Samples: 0

**Called by:**
- `evaluate` (616)

**Calls:**
- `runScenario` (616)

### `parseBlockAt`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:32` | Self: 0.0% (0us) | Total: 0.1% (1.2ms) | Samples: 0

**Called by:**
- `parseBlocks` (1)

**Calls:**
- `parseReferenceDefinitionLine` (1)

### `run`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:50` | Self: 0.0% (0us) | Total: 1.0% (8.6ms) | Samples: 0

**Called by:**
- `runScenario` (7)

**Calls:**
- `append` (7)

### `parseBlockAt`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:66` | Self: 0.0% (0us) | Total: 48.3% (383.3ms) | Samples: 0

**Called by:**
- `parseBlocks` (298)

**Calls:**
- `parseBlockquoteBlock` (293)
- `parseBlockquoteBlock` (3)
- `parseBlockquoteBlock` (3)

### `rebuildLiveTree`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:75` | Self: 0.0% (0us) | Total: 1.8% (14.3ms) | Samples: 0

**Called by:**
- `append` (11)

**Calls:**
- `parseBlocks` (11)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:34` | Self: 0.0% (0us) | Total: 1.8% (14.3ms) | Samples: 0

**Called by:**
- `append` (11)

**Calls:**
- `rebuildLiveTree` (11)

### `parseBlockquoteBlock`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:681` | Self: 0.0% (0us) | Total: 0.4% (3.8ms) | Samples: 0

**Called by:**
- `parseBlockAt` (3)

**Calls:**
- `map` (3)

### `tryIncrementalCodeBlockAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:182` | Self: 0.0% (0us) | Total: 87.7% (696.4ms) | Samples: 0

**Called by:**
- `append` (544)

**Calls:**
- `hasClosingFence` (300)
- `hasClosingFence` (150)
- `hasClosingFence` (94)

### `moduleEvaluation`
`[native code]` | Self: 0.0% (0us) | Total: 100.0% (1.57s) | Samples: 0

**Called by:**
- `moduleEvaluation` (616)
- `async loadAndEvaluateModule` (616)

**Calls:**
- `moduleEvaluation` (616)
- `evaluate` (616)

### `remapNodePositions`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:752` | Self: 0.0% (0us) | Total: 0.1% (1.2ms) | Samples: 0

**Called by:**
- `map` (1)

**Calls:**
- `cloneObject` (1)

### `parseListAtIndent`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:858` | Self: 0.0% (0us) | Total: 0.1% (1.0ms) | Samples: 0

**Called by:**
- `parseListBlock` (1)

**Calls:**
- `parseStrippedBlock` (1)

### `tryIncrementalCodeBlockAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:173` | Self: 0.0% (0us) | Total: 0.1% (1.1ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `match` (1)

### `parseReferenceDefinitionLine`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:191` | Self: 0.0% (0us) | Total: 0.1% (1.2ms) | Samples: 0

**Called by:**
- `parseBlockAt` (1)

**Calls:**
- `slice` (1)

### `parseBlockquoteBlock`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:670` | Self: 0.0% (0us) | Total: 0.4% (3.9ms) | Samples: 0

**Called by:**
- `parseBlockAt` (3)

**Calls:**
- `buildBlockquoteBoundaryMap` (1)
- `buildBlockquoteBoundaryMap` (1)
- `buildBlockquoteBoundaryMap` (1)

### `append`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:33` | Self: 0.0% (0us) | Total: 0.1% (1.3ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `consumeCommittedBlocks` (1)

### `tryIncrementalTableAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:336` | Self: 0.0% (0us) | Total: 0.1% (1.2ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `parseTableBodyRow` (1)

### `getPendingSuffixLength`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:36` | Self: 0.0% (0us) | Total: 2.3% (18.9ms) | Samples: 0

**Called by:**
- `tryFastPlainTextAppend` (15)

**Calls:**
- `match` (15)

### `tryIncrementalListAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:229` | Self: 0.0% (0us) | Total: 0.1% (1.1ms) | Samples: 0

**Called by:**
- `append` (1)

**Calls:**
- `split` (1)

### `wouldIntroduceCommitBoundary`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:163` | Self: 0.0% (0us) | Total: 3.2% (25.7ms) | Samples: 0

**Called by:**
- `tryIncrementalActiveBlockAppend` (20)

**Calls:**
- `endsWith` (20)

### `run`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:62` | Self: 0.0% (0us) | Total: 1.1% (9.0ms) | Samples: 0

**Called by:**
- `runScenario` (7)

**Calls:**
- `append` (7)

### `run`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:19` | Self: 0.0% (0us) | Total: 3.0% (24.0ms) | Samples: 0

**Called by:**
- `runScenario` (19)

**Calls:**
- `appendCharByChar` (19)

### `remapNodePositions`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:748` | Self: 0.0% (0us) | Total: 31.7% (251.7ms) | Samples: 0

**Called by:**
- `map` (184)

**Calls:**
- `map` (184)

### `run`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:39` | Self: 0.0% (0us) | Total: 90.0% (714.6ms) | Samples: 0

**Called by:**
- `runScenario` (559)

**Calls:**
- `append` (559)

### `runScenario`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:69` | Self: 0.0% (0us) | Total: 99.3% (788.2ms) | Samples: 0

**Called by:**
- `(module)` (616)

**Calls:**
- `run` (559)
- `run` (19)
- `run` (19)
- `run` (7)
- `run` (7)
- `run` (2)
- `run` (1)
- `run` (1)
- `run` (1)

### `parseBlockAt`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:82` | Self: 0.0% (0us) | Total: 0.1% (1.2ms) | Samples: 0

**Called by:**
- `parseBlocks` (1)

**Calls:**
- `parseTableBlock` (1)

### `tryIncrementalListAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:251` | Self: 0.0% (0us) | Total: 0.5% (4.1ms) | Samples: 0

**Called by:**
- `append` (3)

**Calls:**
- `parseInline` (2)
- `parseInline` (1)

### `linkAndEvaluateModule`
`[native code]` | Self: 0.0% (0us) | Total: 0.3% (2.5ms) | Samples: 0

**Called by:**
- `async loadAndEvaluateModule` (1)

**Calls:**
- `link` (1)

### `parseBlockAt`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:58` | Self: 0.0% (0us) | Total: 0.1% (1.4ms) | Samples: 0

**Called by:**
- `parseBlocks` (1)

**Calls:**
- `parseFencedCodeBlock` (1)

### `parseStrippedBlock`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:1017` | Self: 0.0% (0us) | Total: 0.1% (1.0ms) | Samples: 0

**Called by:**
- `parseListAtIndent` (1)

**Calls:**
- `join` (1)

### `parseListBlock`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:779` | Self: 0.0% (0us) | Total: 0.3% (2.4ms) | Samples: 0

**Called by:**
- `parseBlockAt` (2)

**Calls:**
- `parseListAtIndent` (1)
- `parseListAtIndent` (1)

### `parseParagraph`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:136` | Self: 0.0% (0us) | Total: 0.1% (1.5ms) | Samples: 0

**Called by:**
- `parseBlocks` (1)

**Calls:**
- `parseInline` (1)

### `parseInline`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:168` | Self: 0.0% (0us) | Total: 0.3% (2.7ms) | Samples: 0

**Called by:**
- `tryIncrementalListAppend` (2)

**Calls:**
- `parseOptimisticCodeSpanAt` (2)

### `run`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:27` | Self: 0.0% (0us) | Total: 3.1% (25.1ms) | Samples: 0

**Called by:**
- `runScenario` (19)

**Calls:**
- `append` (19)

### `hasClosingFence`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:196` | Self: 0.0% (0us) | Total: 23.9% (190.1ms) | Samples: 0

**Called by:**
- `tryIncrementalCodeBlockAppend` (150)

**Calls:**
- `stringSplitFast` (150)

### `append`
`/Users/koen/Documents/MarkdownParser/src/StreamingParser.ts:12` | Self: 0.0% (0us) | Total: 98.9% (785.5ms) | Samples: 0

**Called by:**
- `run` (559)
- `run` (19)
- `appendCharByChar` (19)
- `run` (7)
- `run` (7)
- `run` (2)
- `run` (1)

**Calls:**
- `append` (582)
- `append` (20)
- `append` (11)
- `append` (1)

### `tryIncrementalActiveBlockAppend`
`/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts:131` | Self: 0.0% (0us) | Total: 3.5% (28.4ms) | Samples: 0

**Called by:**
- `append` (22)

**Calls:**
- `wouldIntroduceCommitBoundary` (20)
- `wouldIntroduceCommitBoundary` (1)
- `startsWith` (1)

### `parseBlocks`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:21` | Self: 0.0% (0us) | Total: 49.1% (389.9ms) | Samples: 0

**Called by:**
- `parseBlockquoteBlock` (293)
- `rebuildLiveTree` (11)

**Calls:**
- `parseBlockAt` (298)
- `parseBlockAt` (2)
- `parseBlockAt` (1)
- `parseBlockAt` (1)
- `parseBlockAt` (1)
- `parseParagraph` (1)

### `run`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:48` | Self: 0.0% (0us) | Total: 0.1% (1.2ms) | Samples: 0

**Called by:**
- `runScenario` (1)

**Calls:**
- `append` (1)

### `appendCharByChar`
`/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts:5` | Self: 0.0% (0us) | Total: 3.0% (24.0ms) | Samples: 0

**Called by:**
- `run` (19)

**Calls:**
- `append` (19)

### `getPendingSuffixLength`
`/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts:41` | Self: 0.0% (0us) | Total: 0.1% (896us) | Samples: 0

**Called by:**
- `tryFastPlainTextAppend` (1)

**Calls:**
- `endsWithUnescapedSingleMarker` (1)

### `parseBlockAt`
`/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts:74` | Self: 0.0% (0us) | Total: 0.3% (2.4ms) | Samples: 0

**Called by:**
- `parseBlocks` (2)

**Calls:**
- `parseListBlock` (2)

## Files

| Self% | Self | File |
|------:|-----:|------|
| 79.9% | 634.7ms | `[native code]` |
| 18.0% | 143.0ms | `/Users/koen/Documents/MarkdownParser/src/parser/ParserEngine.ts` |
| 0.8% | 6.6ms | `/Users/koen/Documents/MarkdownParser/src/parser/BlockReducer.ts` |
| 0.6% | 5.1ms | `/Users/koen/Documents/MarkdownParser/src/parser/InlineReducer.ts` |
| 0.3% | 2.6ms | `/Users/koen/Documents/MarkdownParser/bench/parser.append.bench.ts` |
| 0.1% | 1.3ms | `/Users/koen/Documents/MarkdownParser/src/parser/LineScanner.ts` |
