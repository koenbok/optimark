import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";
import { node } from "./helpers/ast";

describe("Parser.append hard/soft breaks", () => {
  it("parses soft break on plain newline", () => {
    const parser = new StreamingParser("");
    parser.append("a\nb");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 3, [
        node("text", 0, 1),
        node("soft_break", 1, 2),
        node("text", 2, 3),
      ]),
    ]);
  });

  it("parses hard break on two spaces before newline", () => {
    const parser = new StreamingParser("");
    parser.append("a  \nb");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [
        node("text", 0, 1),
        node("line_break", 1, 4),
        node("text", 4, 5),
      ]),
    ]);
  });

  it("parses hard break on backslash + newline", () => {
    const parser = new StreamingParser("");
    parser.append("a\\\nb");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 4, [
        node("text", 0, 1),
        node("line_break", 1, 3),
        node("text", 3, 4),
      ]),
    ]);
  });

  it("parses line breaks inside list item paragraph", () => {
    const parser = new StreamingParser("");
    parser.append("- a\\\n  b");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 8,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 8,
            children: [
              node("paragraph", 2, 8, [
                node("text", 2, 3),
                node("line_break", 3, 7),
                node("text", 7, 8),
              ]),
            ],
          },
        ],
      },
    ]);
  });
});
