import { describe, expect, it } from "bun:test";
import { Parser } from "../Parser";

describe("Parser.append thematic breaks", () => {
  it("parses --- as thematic break", () => {
    const parser = new Parser("");
    parser.append("---");

    expect(parser.getLiveTree()).toEqual([
      { type: "thematic_break", start: 0, end: 3 },
    ]);
  });

  it("parses *** as thematic break", () => {
    const parser = new Parser("");
    parser.append("***");

    expect(parser.getLiveTree()).toEqual([
      { type: "thematic_break", start: 0, end: 3 },
    ]);
  });

  it("does not parse -- as thematic break", () => {
    const parser = new Parser("");
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

  it("parses thematic break inside blockquote", () => {
    const parser = new Parser("");
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
