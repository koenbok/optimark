import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

function parseOneShot(text: string) {
  const parser = new StreamingParser("");
  parser.append(text);
  return parser.getLiveTree();
}

function parseByChars(text: string) {
  const parser = new StreamingParser("");
  for (const ch of text) {
    parser.append(ch);
  }
  return parser.getLiveTree();
}

describe("Parser optimistic parity", () => {
  it("matches one-shot output for strikethrough and multi-backtick code spans", () => {
    const text = "~~x~~ and `` `y` ``";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for long ordered-list markers", () => {
    const text = "1234567890. a\n1234567891. b";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for aggressive autolink promotion", () => {
    const text = "<https://example.com>";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for aggressive html-comment promotion", () => {
    const text = "<!-- hi-->";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });
});
