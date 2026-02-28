import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

const parseByChunks = (chunks: string[]) => {
  const parser = new StreamingParser("");
  for (const chunk of chunks) {
    parser.append(chunk);
  }
  return parser.getLiveTree();
};

describe("Parser state machine fallback parity", () => {
  it("matches one-shot parsing when closing fence arrives char-by-char", () => {
    const input = "```\na\n```";
    const oneShot = new StreamingParser(input).getLiveTree();
    const chunked = parseByChunks(["```", "\n", "a", "\n", "`", "`", "`"]);
    expect(chunked).toEqual(oneShot);
  });

  it("matches one-shot parsing when a list is interrupted by plain text", () => {
    const input = "- one\ntail";
    const oneShot = new StreamingParser(input).getLiveTree();
    const chunked = parseByChunks(["- one\n", "tail"]);
    expect(chunked).toEqual(oneShot);
  });

  it("matches one-shot parsing when table growth receives non-row tail", () => {
    const input = "| h |\n| --- |\ntail";
    const oneShot = new StreamingParser(input).getLiveTree();
    const chunked = parseByChunks(["| h |\n| --- |\n", "tail"]);
    expect(chunked).toEqual(oneShot);
  });
});
