import { describe, expect, it } from "bun:test";
import { V2Parser } from "../../v2/V2Parser";

const chunkCharByChar = (text: string): string[] => Array.from(text);

const chunkLineByLine = (text: string): string[] => {
  const chunks: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== "\n") continue;
    chunks.push(text.slice(start, i + 1));
    start = i + 1;
  }
  if (start < text.length) chunks.push(text.slice(start));
  return chunks;
};

const chunkFixed = (text: string, size: number): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
};

const parseByChunks = (text: string, chunks: string[]) => {
  const parser = new V2Parser("");
  for (const chunk of chunks) {
    parser.append(chunk);
  }
  return parser.getLiveTree();
};

describe("V2 chunk invariance", () => {
  const corpus = [
    "plain text",
    "# heading",
    "a\n\nb",
    "- item 1\n- item 2",
    "1. first\n2. second",
    "> quote\n> next",
    "```ts\nconst x = 1;\n```",
    "| a | b |\n| --- | --- |\n| 1 | 2 |",
    "link [x](https://example.com) and `code`",
  ];

  it("matches one-shot parsing for char-by-char appends", () => {
    for (const input of corpus) {
      const oneShot = new V2Parser(input).getLiveTree();
      const chunked = parseByChunks(input, chunkCharByChar(input));
      expect(chunked).toEqual(oneShot);
    }
  });

  it("matches one-shot parsing for line-by-line appends", () => {
    for (const input of corpus) {
      const oneShot = new V2Parser(input).getLiveTree();
      const chunked = parseByChunks(input, chunkLineByLine(input));
      expect(chunked).toEqual(oneShot);
    }
  });

  it("matches one-shot parsing for fixed-size chunks", () => {
    for (const input of corpus) {
      const oneShot = new V2Parser(input).getLiveTree();
      const chunked = parseByChunks(input, chunkFixed(input, 4));
      expect(chunked).toEqual(oneShot);
    }
  });
});
