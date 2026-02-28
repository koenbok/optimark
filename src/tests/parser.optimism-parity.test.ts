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

  it("matches one-shot output when list item starts after plain line", () => {
    const text = "Early Life\n- Born";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for setext/list ambiguity with short item", () => {
    const text = "Title\n- a";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for setext/list ambiguity with multi-word item", () => {
    const text = "Title\n- b c";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for multi-item unordered lists after a plain line", () => {
    const text = "Title\n- item\n- next";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for task-list marker after a plain line", () => {
    const text = "Early Life\n- [ ] task";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for biography line followed by list item", () => {
    const text = "Rise to Fame (1960s)\n- Moved to New York City in 1961";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for ATX heading followed by list item text", () => {
    const text =
      "## Later Career & Legacy (2000s–present)\n- Experienced a major creative renaissance wi";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for setext heading with double-dash underline", () => {
    const text = "Title\n--";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });

  it("matches one-shot output for setext heading with triple-dash underline", () => {
    const text = "Title\n---";
    expect(parseByChars(text)).toEqual(parseOneShot(text));
  });
});
