import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

describe("Parser.append thematic breaks", () => {
  it("parses --- as thematic break", () => {
    const parser = new StreamingParser("");
    parser.append("---");

    expect(parser.getLiveTree()).toEqual([
      { type: "thematic_break", start: 0, end: 3 },
    ]);
  });

  it("parses *** as thematic break", () => {
    const parser = new StreamingParser("");
    parser.append("***");

    expect(parser.getLiveTree()).toEqual([
      { type: "thematic_break", start: 0, end: 3 },
    ]);
  });

  it("parses ___ as thematic break", () => {
    const parser = new StreamingParser("");
    parser.append("___");

    expect(parser.getLiveTree()).toEqual([
      { type: "thematic_break", start: 0, end: 3 },
    ]);
  });

  it("parses spaced marker thematic breaks", () => {
    const parser = new StreamingParser("");
    parser.append("- - -");

    expect(parser.getLiveTree()).toEqual([
      { type: "thematic_break", start: 0, end: 5 },
    ]);
  });

  it("parses thematic breaks indented up to three spaces", () => {
    const parser = new StreamingParser("");
    parser.append("   ---");

    expect(parser.getLiveTree()).toEqual([
      { type: "thematic_break", start: 0, end: 6 },
    ]);
  });

  it("does not parse -- as thematic break", () => {
    const parser = new StreamingParser("");
    parser.append("--");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "paragraph",
        start: 0,
        end: 2,
        children: [{ type: "text", start: 0, end: 2 }],
      },
    ]);
  });

  it("does not parse thematic breaks indented four spaces", () => {
    const parser = new StreamingParser("");
    parser.append("    ---");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "paragraph",
        start: 0,
        end: 7,
        children: [{ type: "text", start: 0, end: 7 }],
      },
    ]);
  });

  it("does not parse mixed marker lines as thematic breaks", () => {
    const parser = new StreamingParser("");
    parser.append("- * -");

    const tree = parser.getLiveTree();
    expect(tree).toHaveLength(1);
    expect(tree[0]?.type).not.toBe("thematic_break");
  });

  it("parses thematic break inside blockquote", () => {
    const parser = new StreamingParser("");
    parser.append("> ---");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 5,
        children: [{ type: "thematic_break", start: 2, end: 5 }],
      },
    ]);
  });
});
