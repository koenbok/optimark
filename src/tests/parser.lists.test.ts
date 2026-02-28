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

  it("splits list and paragraph when list is interrupted by non-list line", () => {
    const parser = new StreamingParser("");
    parser.append("- a\nnot-list");

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
      {
        type: "paragraph",
        start: 4,
        end: 12,
        children: [
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

  it("optimistically keeps a trailing numeric marker inside an ordered list", () => {
    const parser = new StreamingParser("");
    parser.append("1. Afghanistan\n2. Albania\n3");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 27,
        ordered: true,
        startNumber: 1,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 14,
            children: [
              {
                type: "paragraph",
                start: 3,
                end: 14,
                children: [{ type: "text", start: 3, end: 14 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 15,
            end: 25,
            children: [
              {
                type: "paragraph",
                start: 18,
                end: 25,
                children: [{ type: "text", start: 18, end: 25 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 26,
            end: 27,
            children: [
              {
                type: "paragraph",
                start: 27,
                end: 27,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("keeps a trailing numeric marker in-list across incremental append calls", () => {
    const parser = new StreamingParser("");
    parser.append("1. Afghanistan\n2. Albania\n");
    parser.append("3");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 27,
        ordered: true,
        startNumber: 1,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 14,
            children: [
              {
                type: "paragraph",
                start: 3,
                end: 14,
                children: [{ type: "text", start: 3, end: 14 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 15,
            end: 25,
            children: [
              {
                type: "paragraph",
                start: 18,
                end: 25,
                children: [{ type: "text", start: 18, end: 25 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 26,
            end: 27,
            children: [
              {
                type: "paragraph",
                start: 27,
                end: 27,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("keeps nested trailing numeric marker inside nested ordered list", () => {
    const parser = new StreamingParser("");
    parser.append("- Countries\n  1. Afghanistan\n  2. Albania\n  3");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 45,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 45,
            children: [
              {
                type: "paragraph",
                start: 2,
                end: 11,
                children: [{ type: "text", start: 2, end: 11 }],
              },
              {
                type: "list",
                start: 12,
                end: 45,
                ordered: true,
                startNumber: 1,
                tight: false,
                children: [
                  {
                    type: "list_item",
                    start: 12,
                    end: 28,
                    children: [
                      {
                        type: "paragraph",
                        start: 17,
                        end: 28,
                        children: [{ type: "text", start: 17, end: 28 }],
                      },
                    ],
                  },
                  {
                    type: "list_item",
                    start: 29,
                    end: 41,
                    children: [
                      {
                        type: "paragraph",
                        start: 34,
                        end: 41,
                        children: [{ type: "text", start: 34, end: 41 }],
                      },
                    ],
                  },
                  {
                    type: "list_item",
                    start: 42,
                    end: 45,
                    children: [
                      {
                        type: "paragraph",
                        start: 45,
                        end: 45,
                        children: [],
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

  it("optimistically keeps trailing numeric marker for parenthesis ordered lists", () => {
    const parser = new StreamingParser("");
    parser.append("1) one\n2) two\n3");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 15,
        ordered: true,
        startNumber: 1,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 6,
            children: [
              {
                type: "paragraph",
                start: 3,
                end: 6,
                children: [{ type: "text", start: 3, end: 6 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 7,
            end: 13,
            children: [
              {
                type: "paragraph",
                start: 10,
                end: 13,
                children: [{ type: "text", start: 10, end: 13 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 14,
            end: 15,
            children: [
              {
                type: "paragraph",
                start: 15,
                end: 15,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("accepts ordered markers with more than nine digits", () => {
    const parser = new StreamingParser("");
    parser.append("1234567890. a\n1234567891. b");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 27,
        ordered: true,
        startNumber: 1234567890,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 13,
            children: [
              {
                type: "paragraph",
                start: 12,
                end: 13,
                children: [{ type: "text", start: 12, end: 13 }],
              },
            ],
          },
          {
            type: "list_item",
            start: 14,
            end: 27,
            children: [
              {
                type: "paragraph",
                start: 26,
                end: 27,
                children: [{ type: "text", start: 26, end: 27 }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("optimistically treats standalone trailing '3' as an ordered item-in-progress", () => {
    const parser = new StreamingParser("");
    parser.append("3");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 1,
        ordered: true,
        startNumber: 3,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 1,
            children: [
              {
                type: "paragraph",
                start: 1,
                end: 1,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("optimistically treats standalone trailing '3.' as an ordered item-in-progress", () => {
    const parser = new StreamingParser("");
    parser.append("3.");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 2,
        ordered: true,
        startNumber: 3,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 2,
            children: [
              {
                type: "paragraph",
                start: 2,
                end: 2,
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("treats a trailing '3.' without space as an in-progress ordered item", () => {
    const parser = new StreamingParser("");
    parser.append("1. a\n2. b\n3.");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 12,
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
          {
            type: "list_item",
            start: 10,
            end: 12,
            children: [
              {
                type: "paragraph",
                start: 12,
                end: 12,
                children: [],
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
