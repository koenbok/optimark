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

  it("matches one-shot parsing when setext-like tail resolves into a list item", () => {
    const input = "Title\n- a";
    const oneShot = new StreamingParser(input).getLiveTree();
    const chunked = parseByChunks(["Title\n-", " a"]);
    expect(chunked).toEqual(oneShot);
  });

  it("matches one-shot parsing when setext-like '- ' tail resolves into list text", () => {
    const input = "Title\n- item";
    const oneShot = new StreamingParser(input).getLiveTree();
    const chunked = parseByChunks(["Title\n- ", "item"]);
    expect(chunked).toEqual(oneShot);
  });

  it("matches one-shot parsing for biography line when list text arrives after '-'", () => {
    const input = "Rise to Fame (1960s)\n- Moved to New York City in 1961";
    const oneShot = new StreamingParser(input).getLiveTree();
    const chunked = parseByChunks([
      "Rise to Fame (1960s)\n-",
      " Moved to New York City in 1961",
    ]);
    expect(chunked).toEqual(oneShot);
  });

  it("matches one-shot parsing when ATX heading is followed by streamed list text", () => {
    const input =
      "## Later Career & Legacy (2000s–present)\n- Experienced a major creative renaissance wi";
    const oneShot = new StreamingParser(input).getLiveTree();
    const chunked = parseByChunks([
      "## Later Career & Legacy (2000s–present)\n-",
      " Experienced a major creative renaissance wi",
    ]);
    expect(chunked).toEqual(oneShot);
  });
});
