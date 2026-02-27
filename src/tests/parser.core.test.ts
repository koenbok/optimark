import { describe, expect, it } from "bun:test";
import { Parser } from "../Parser";
import { node } from "./helpers/ast";

describe("Parser.append core", () => {
  it("parses constructor initial text immediately", () => {
    const parser = new Parser("seed");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 4, [node("text", 0, 4)]),
    ]);
  });

  it("appends plain text and builds a paragraph AST", () => {
    const parser = new Parser("");
    parser.append("hello");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [node("text", 0, 5)]),
    ]);
  });

  it("consumes completed blocks and keeps active block", () => {
    const parser = new Parser("");
    parser.append("first\n\nsecond");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [node("text", 0, 5)]),
      node("paragraph", 7, 13, [node("text", 7, 13)]),
    ]);
  });

  it("buffers partial tags and then parses optimistic strong node", () => {
    const parser = new Parser("");

    parser.append("*");
    expect(parser.getLiveTree()).toEqual([]);
    expect(parser.getPendingText()).toEqual("*");

    parser.append("*hello");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 7, [node("strong", 0, 7, [node("text", 2, 7)])]),
    ]);
  });

  it("auto-closes nested inline tags in active buffer", () => {
    const parser = new Parser("");
    parser.append("**hello *world");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 14, [
        node("strong", 0, 14, [
          node("text", 2, 8),
          node("emphasis", 8, 14, [node("text", 9, 14)]),
        ]),
      ]),
    ]);
  });

  it("tracks absolute offsets across multiple committed appends", () => {
    const parser = new Parser("");
    parser.append("one\n\n");
    parser.append("two\n\n");
    parser.append("three");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 3, [node("text", 0, 3)]),
      node("paragraph", 5, 8, [node("text", 5, 8)]),
      node("paragraph", 10, 15, [node("text", 10, 15)]),
    ]);
  });

  it("parses heading depth metadata", () => {
    const parser = new Parser("");
    parser.append("### title");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "heading",
        start: 0,
        end: 9,
        depth: 3,
        children: [node("text", 4, 9)],
      },
    ]);
  });

  it("treats empty append as a no-op", () => {
    const parser = new Parser("abc");
    parser.append("");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 3, [node("text", 0, 3)]),
    ]);
  });
});
