import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

describe("Parser.append optimistic lists", () => {
  it("promotes '- item' into a list with one item", () => {
    const parser = new StreamingParser("");
    parser.append("- hello");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 7,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 7,
            children: [
              {
                type: "paragraph",
                start: 2,
                end: 7,
                children: [{ type: "text", start: 2, end: 7 }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("supports nested unordered list items by indentation", () => {
    const parser = new StreamingParser("");
    parser.append("- parent\n  - child");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 18,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 18,
            children: [
              {
                type: "paragraph",
                start: 2,
                end: 8,
                children: [{ type: "text", start: 2, end: 8 }],
              },
              {
                type: "list",
                start: 9,
                end: 18,
                ordered: false,
                tight: false,
                children: [
                  {
                    type: "list_item",
                    start: 9,
                    end: 18,
                    children: [
                      {
                        type: "paragraph",
                        start: 13,
                        end: 18,
                        children: [{ type: "text", start: 13, end: 18 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("parses multiple sibling list items", () => {
    const parser = new StreamingParser("");
    parser.append("- a\n- b");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 7,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 3,
            children: [
              {
                type: "paragraph",
                start: 2,
                end: 3,
                children: [{ type: "text", start: 2, end: 3 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 4,
            end: 7,
            children: [
              {
                type: "paragraph",
                start: 6,
                end: 7,
                children: [{ type: "text", start: 6, end: 7 }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("falls back to paragraph when list is interrupted by non-list line", () => {
    const parser = new StreamingParser("");
    parser.append("- a\nnot-list");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "paragraph",
        start: 0,
        end: 12,
        children: [
          { type: "text", start: 0, end: 3 },
          { type: "soft_break", start: 3, end: 4 },
          { type: "text", start: 4, end: 12 },
        ],
      },
    ]);
  });

  it("supports incremental growth from one item to nested list", () => {
    const parser = new StreamingParser("");
    parser.append("- p");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 3,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 3,
            children: [
              {
                type: "paragraph",
                start: 2,
                end: 3,
                children: [{ type: "text", start: 2, end: 3 }],
              },
            ],
          },
        ],
      },
    ]);

    parser.append("\n  - c");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 9,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 9,
            children: [
              {
                type: "paragraph",
                start: 2,
                end: 3,
                children: [{ type: "text", start: 2, end: 3 }],
              },
              {
                type: "list",
                start: 4,
                end: 9,
                ordered: false,
                tight: false,
                children: [
                  {
                    type: "list_item",
                    start: 4,
                    end: 9,
                    children: [
                      {
                        type: "paragraph",
                        start: 8,
                        end: 9,
                        children: [{ type: "text", start: 8, end: 9 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("parses ordered list items", () => {
    const parser = new StreamingParser("");
    parser.append("1. a\n2. b");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 9,
        ordered: true,
        startNumber: 1,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 4,
            children: [
              {
                type: "paragraph",
                start: 3,
                end: 4,
                children: [{ type: "text", start: 3, end: 4 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 5,
            end: 9,
            children: [
              {
                type: "paragraph",
                start: 8,
                end: 9,
                children: [{ type: "text", start: 8, end: 9 }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("tracks ordered list startNumber from first marker", () => {
    const parser = new StreamingParser("");
    parser.append("3. c\n4. d");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 9,
        ordered: true,
        startNumber: 3,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 4,
            children: [
              {
                type: "paragraph",
                start: 3,
                end: 4,
                children: [{ type: "text", start: 3, end: 4 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 5,
            end: 9,
            children: [
              {
                type: "paragraph",
                start: 8,
                end: 9,
                children: [{ type: "text", start: 8, end: 9 }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("supports unordered parent with nested ordered list", () => {
    const parser = new StreamingParser("");
    parser.append("- a\n  1. b");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 10,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 10,
            children: [
              {
                type: "paragraph",
                start: 2,
                end: 3,
                children: [{ type: "text", start: 2, end: 3 }],
              },
              {
                type: "list",
                start: 4,
                end: 10,
                ordered: true,
                startNumber: 1,
                tight: false,
                children: [
                  {
                    type: "list_item",
                    start: 4,
                    end: 10,
                    children: [
                      {
                        type: "paragraph",
                        start: 9,
                        end: 10,
                        children: [{ type: "text", start: 9, end: 10 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("supports ordered parent with nested unordered list", () => {
    const parser = new StreamingParser("");
    parser.append("1. a\n   - b");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 11,
        ordered: true,
        startNumber: 1,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 11,
            children: [
              {
                type: "paragraph",
                start: 3,
                end: 4,
                children: [{ type: "text", start: 3, end: 4 }],
              },
              {
                type: "list",
                start: 5,
                end: 11,
                ordered: false,
                tight: false,
                children: [
                  {
                    type: "list_item",
                    start: 5,
                    end: 11,
                    children: [
                      {
                        type: "paragraph",
                        start: 10,
                        end: 11,
                        children: [{ type: "text", start: 10, end: 11 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});
