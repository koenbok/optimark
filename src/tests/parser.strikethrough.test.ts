import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";
import { node } from "./helpers/ast";

describe("Parser.append strikethrough", () => {
  it("parses a closed strikethrough span", () => {
    const parser = new StreamingParser("");
    parser.append("~~gone~~");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 8, [
        node("strikethrough", 0, 8, [node("text", 2, 6)]),
      ]),
    ]);
  });

  it("optimistically auto-closes an unfinished strikethrough span", () => {
    const parser = new StreamingParser("");
    parser.append("~~gone");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 6, [
        node("strikethrough", 0, 6, [node("text", 2, 6)]),
      ]),
    ]);
  });

  it("supports nested strong and strikethrough combinations", () => {
    const parser = new StreamingParser("");
    parser.append("**~~x~~** ~~**y**~~");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 19, [
        node("strong", 0, 9, [node("strikethrough", 2, 7, [node("text", 4, 5)])]),
        node("text", 9, 10),
        node("strikethrough", 10, 19, [node("strong", 12, 17, [node("text", 14, 15)])]),
      ]),
    ]);
  });
});
