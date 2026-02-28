import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";
import { node } from "./helpers/ast";

describe("CommonMark conformance edges", () => {
  it("supports lazy blockquote continuation lines", () => {
    const parser = new StreamingParser("> alpha\nbeta");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 12,
        children: [
          node("paragraph", 2, 12, [
            node("text", 2, 7),
            node("soft_break", 7, 8),
            node("text", 8, 12),
          ]),
        ],
      },
    ]);
  });

  it("ends lazy blockquote at a list marker line", () => {
    const parser = new StreamingParser("> alpha\n- beta");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 7,
        children: [node("paragraph", 2, 7, [node("text", 2, 7)])],
      },
      {
        type: "list",
        start: 8,
        end: 14,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 8,
            end: 14,
            children: [node("paragraph", 10, 14, [node("text", 10, 14)])],
          },
        ],
      },
    ]);
  });

  it("splits list then following paragraph without blank line", () => {
    const parser = new StreamingParser("- item\ntail");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 6,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 6,
            children: [node("paragraph", 2, 6, [node("text", 2, 6)])],
          },
        ],
      },
      node("paragraph", 7, 11, [node("text", 7, 11)]),
    ]);
  });

  it("interrupts paragraph with ordered list only at start number 1", () => {
    const parser = new StreamingParser("para\n2. two\n1. one");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 11, [
        node("text", 0, 4),
        node("soft_break", 4, 5),
        node("text", 5, 11),
      ]),
      {
        type: "list",
        start: 12,
        end: 18,
        ordered: true,
        startNumber: 1,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 12,
            end: 18,
            children: [node("paragraph", 15, 18, [node("text", 15, 18)])],
          },
        ],
      },
    ]);
  });

  it("supports blockquote-in-list with lazy continuation", () => {
    const parser = new StreamingParser("- > alpha\n  beta");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 16,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 16,
            children: [
              {
                type: "blockquote",
                start: 2,
                end: 16,
                children: [
                  node("paragraph", 4, 16, [
                    node("text", 4, 9),
                    node("soft_break", 9, 12),
                    node("text", 12, 16),
                  ]),
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("supports list-in-blockquote with lazy continuation", () => {
    const parser = new StreamingParser("> - alpha\n  beta");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 16,
        children: [
          {
            type: "list",
            start: 2,
            end: 16,
            ordered: false,
            tight: false,
            children: [
              {
                type: "list_item",
                start: 2,
                end: 16,
                children: [
                  node("paragraph", 4, 16, [
                    node("text", 4, 9),
                    node("soft_break", 9, 12),
                    node("text", 12, 16),
                  ]),
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("ends blockquote laziness before a top-level list marker", () => {
    const parser = new StreamingParser("> - alpha\n- beta");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 9,
        children: [
          {
            type: "list",
            start: 2,
            end: 9,
            ordered: false,
            tight: false,
            children: [
              {
                type: "list_item",
                start: 2,
                end: 9,
                children: [node("paragraph", 4, 9, [node("text", 4, 9)])],
              },
            ],
          },
        ],
      },
      {
        type: "list",
        start: 10,
        end: 16,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 10,
            end: 16,
            children: [node("paragraph", 12, 16, [node("text", 12, 16)])],
          },
        ],
      },
    ]);
  });

  it("does not treat an ATX heading line as setext content when next line is '-'", () => {
    const parser = new StreamingParser("## Early Life\n-");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "heading",
        start: 0,
        end: 13,
        depth: 2,
        children: [node("text", 3, 13)],
      },
      node("paragraph", 14, 15, [node("text", 14, 15)]),
    ]);
  });

  it("keeps an ATX heading separate from a trailing '--' line", () => {
    const parser = new StreamingParser("## x\n--");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "heading",
        start: 0,
        end: 4,
        depth: 2,
        children: [node("text", 3, 4)],
      },
      node("paragraph", 5, 7, [node("text", 5, 7)]),
    ]);
  });

  it("keeps an ATX heading separate from a trailing thematic break line", () => {
    const parser = new StreamingParser("## x\n---");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "heading",
        start: 0,
        end: 4,
        depth: 2,
        children: [node("text", 3, 4)],
      },
      { type: "thematic_break", start: 5, end: 8 },
    ]);
  });

  it("keeps an ATX heading separate from a trailing '===' line", () => {
    const parser = new StreamingParser("## x\n===");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "heading",
        start: 0,
        end: 4,
        depth: 2,
        children: [node("text", 3, 4)],
      },
      node("paragraph", 5, 8, [node("text", 5, 8)]),
    ]);
  });
});
