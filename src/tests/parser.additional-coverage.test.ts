import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";
import { node } from "./helpers/ast";

describe("Additional markdown coverage", () => {
  it("disables html blocks by default", () => {
    const parser = new StreamingParser("<div>\nhello\n</div>");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 18, [
        { type: "html_inline", start: 0, end: 5, value: "<div>" },
        node("soft_break", 5, 6),
        node("text", 6, 11),
        node("soft_break", 11, 12),
        { type: "html_inline", start: 12, end: 18, value: "</div>" },
      ]),
    ]);
  });

  it("can parse html blocks when explicitly enabled", () => {
    const parser = new StreamingParser("<div>\nhello\n</div>", {
      htmlBlocks: true,
    });
    expect(parser.getLiveTree()).toEqual([
      {
        type: "html_block",
        start: 0,
        end: 18,
        value: "<div>\nhello\n</div>",
      },
    ]);
  });

  it("parses inline html tags", () => {
    const parser = new StreamingParser("x <tag> y");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 9, [
        node("text", 0, 2),
        { type: "html_inline", start: 2, end: 7, value: "<tag>" },
        node("text", 7, 9),
      ]),
    ]);
  });

  it("resolves reference links and keeps definition blocks out of output", () => {
    const parser = new StreamingParser("[ref]: https://example.com \"Title\"\n\n[label][ref]");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "paragraph",
        start: 36,
        end: 48,
        children: [
          {
            type: "link",
            start: 36,
            end: 48,
            url: "https://example.com",
            title: "Title",
            children: [node("text", 37, 42)],
          },
        ],
      },
    ]);
  });

  it("resolves reference images", () => {
    const parser = new StreamingParser("[img]: https://cdn.example/x.png \"Logo\"\n\n![brand][img]");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 41, 54, [
        {
          type: "image",
          start: 41,
          end: 54,
          url: "https://cdn.example/x.png",
          title: "Logo",
          alt: "brand",
        },
      ]),
    ]);
  });

  it("parses inline link/image titles", () => {
    const parser = new StreamingParser(
      '[link](https://example.com "Doc") ![logo](https://cdn/img.png "Logo")',
    );
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 69, [
        {
          type: "link",
          start: 0,
          end: 33,
          url: "https://example.com",
          title: "Doc",
          children: [node("text", 1, 5)],
        },
        node("text", 33, 34),
        {
          type: "image",
          start: 34,
          end: 69,
          url: "https://cdn/img.png",
          title: "Logo",
          alt: "logo",
        },
      ]),
    ]);
  });

  it("parses email autolinks", () => {
    const parser = new StreamingParser("<user@example.com>");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 18, [
        {
          type: "autolink",
          start: 0,
          end: 18,
          url: "mailto:user@example.com",
        },
      ]),
    ]);
  });

  it("supports ~~~ fenced code blocks", () => {
    const parser = new StreamingParser("~~~ts\nconst x = 1;\n~~~");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "code_block",
        start: 0,
        end: 22,
        language: "ts",
        meta: null,
        value: "const x = 1;",
      },
    ]);
  });

  it("parses setext headings", () => {
    const parser = new StreamingParser("Title\n---");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "heading",
        start: 0,
        end: 9,
        depth: 2,
        children: [node("text", 0, 5)],
      },
    ]);
  });

  it("decodes html entities in reference destinations and titles", () => {
    const parser = new StreamingParser(
      '[r]: https://e.com?a=1&amp;b=2 "A &amp; B"\n\n[x][r]',
    );
    expect(parser.getLiveTree()).toEqual([
      {
        type: "paragraph",
        start: 44,
        end: 50,
        children: [
          {
            type: "link",
            start: 44,
            end: 50,
            url: "https://e.com?a=1&b=2",
            title: "A & B",
            children: [node("text", 45, 46)],
          },
        ],
      },
    ]);
  });

  it("accepts ordered-list parenthesis markers", () => {
    const parser = new StreamingParser("1) one\n2) two");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 13,
        ordered: true,
        startNumber: 1,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 6,
            children: [node("paragraph", 3, 6, [node("text", 3, 6)])],
          },
          {
            type: "list_item",
            start: 7,
            end: 13,
            children: [node("paragraph", 10, 13, [node("text", 10, 13)])],
          },
        ],
      },
    ]);
  });

  it("keeps table cells inline-only", () => {
    const parser = new StreamingParser("| a |\n|---|\n| **x** |");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "table",
        start: 0,
        end: 21,
        align: [null],
        children: [
          {
            type: "table_row",
            start: 0,
            end: 5,
            children: [
              {
                type: "table_cell",
                header: true,
                start: 2,
                end: 3,
                children: [node("text", 2, 3)],
              },
            ],
          },
          {
            type: "table_row",
            start: 12,
            end: 21,
            children: [node("table_cell", 14, 19, [node("strong", 14, 19, [node("text", 16, 17)])])],
          },
        ],
      },
    ]);
  });

  it("parses tables as blockquote children when prefixed", () => {
    const parser = new StreamingParser("> a | b\n> - | -");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 15,
        children: [
          {
            type: "table",
            start: 2,
            end: 15,
            align: [null, null],
            children: [
              {
                type: "table_row",
                start: 2,
                end: 7,
                children: [
                  {
                    type: "table_cell",
                    header: true,
                    start: 2,
                    end: 3,
                    children: [node("text", 2, 3)],
                  },
                  {
                    type: "table_cell",
                    header: true,
                    start: 6,
                    end: 7,
                    children: [node("text", 6, 7)],
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
