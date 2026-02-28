import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

const chunkCharByChar = (text: string): string[] => Array.from(text);

const chunkLineByLine = (text: string): string[] => {
  const chunks: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== "\n") continue;
    chunks.push(text.slice(start, i + 1));
    start = i + 1;
  }
  if (start < text.length) {
    chunks.push(text.slice(start));
  }
  return chunks;
};

const chunkFixed = (text: string, size: number): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
};

const chunkFenceAware = (text: string): string[] => {
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const nextFence = text.indexOf("```", cursor);
    if (nextFence === -1) {
      chunks.push(text.slice(cursor));
      break;
    }
    if (nextFence > cursor) {
      chunks.push(text.slice(cursor, nextFence));
    }
    chunks.push("```");
    cursor = nextFence + 3;
  }
  return chunks.filter((chunk) => chunk.length > 0);
};

const parseByChunks = (
  text: string,
  chunks: string[],
): ReturnType<StreamingParser["getLiveTree"]> => {
  const parser = new StreamingParser("");
  for (const chunk of chunks) {
    parser.append(chunk);
  }
  return parser.getLiveTree();
};

describe("Parser chunk invariance", () => {
  const corpus = [
    "plain text",
    "a\n\nb",
    "# title\n\npara",
    "- [ ] task\n- [x] done",
    "> quote\n> next",
    "```\na\n\nb\n```",
    "~~~\na\n~~~",
    "| h |\n| --- |\n| a |\ntail",
    "| h1 | h2 |\n| --- | --- |\n| a | b |\ntail",
    "mix **strong** and [link](x) and `code`",
  ];

  it("matches one-shot parsing for char-by-char appends", () => {
    for (const input of corpus) {
      const oneShot = new StreamingParser(input).getLiveTree();
      const chunked = parseByChunks(input, chunkCharByChar(input));
      expect(chunked).toEqual(oneShot);
    }
  });

  it("matches one-shot parsing for line-by-line appends", () => {
    for (const input of corpus) {
      const oneShot = new StreamingParser(input).getLiveTree();
      const chunked = parseByChunks(input, chunkLineByLine(input));
      expect(chunked).toEqual(oneShot);
    }
  });

  it("matches one-shot parsing for fixed-size chunks", () => {
    for (const input of corpus) {
      const oneShot = new StreamingParser(input).getLiveTree();
      const chunked = parseByChunks(input, chunkFixed(input, 5));
      expect(chunked).toEqual(oneShot);
    }
  });

  it("matches one-shot parsing for fence-aware chunking", () => {
    for (const input of corpus) {
      const oneShot = new StreamingParser(input).getLiveTree();
      const chunked = parseByChunks(input, chunkFenceAware(input));
      expect(chunked).toEqual(oneShot);
    }
  });
});
