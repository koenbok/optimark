import { describe, expect, it } from "bun:test";
import { Parser } from "../Parser";
import { node } from "./helpers/ast";

describe("Parser.append blockquotes", () => {
  it("parses a simple blockquote line", () => {
    const parser = new Parser("");
    parser.append("> quote");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 7,
        children: [node("paragraph", 2, 7, [node("text", 2, 7)])],
      },
    ]);
  });

  it("parses nested blockquotes", () => {
    const parser = new Parser("");
    parser.append("> > quote");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 9,
        children: [
          {
            type: "blockquote",
            start: 2,
            end: 9,
            children: [node("paragraph", 4, 9, [node("text", 4, 9)])],
          },
        ],
      },
    ]);
  });

  it("parses a list inside blockquote", () => {
    const parser = new Parser("");
    parser.append("> - item");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 8,
        children: [
          {
            type: "list",
            start: 2,
            end: 8,
            ordered: false,
            tight: false,
            children: [
              {
                type: "list_item",
                start: 2,
                end: 8,
                children: [
                  {
                    type: "paragraph",
                    start: 4,
                    end: 8,
                    children: [{ type: "text", start: 4, end: 8 }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("parses a task item inside blockquote", () => {
    const parser = new Parser("");
    parser.append("> - [x] item");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 12,
        children: [
          {
            type: "list",
            start: 2,
            end: 12,
            ordered: false,
            tight: false,
            children: [
              {
                type: "task_item",
                checked: true,
                start: 2,
                end: 12,
                children: [
                  {
                    type: "paragraph",
                    start: 8,
                    end: 12,
                    children: [{ type: "text", start: 8, end: 12 }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("supports inline code and escapes inside blockquotes", () => {
    const parser = new Parser("");
    parser.append("> \\*x\\* and `c`");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 15,
        children: [
          {
            type: "paragraph",
            start: 2,
            end: 15,
            children: [
              node("text", 2, 12),
              { type: "code_span", start: 12, end: 15, value: "c" },
            ],
          },
        ],
      },
    ]);
  });

  it("supports incremental growth while typing a blockquote", () => {
    const parser = new Parser("");
    parser.append(">");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 1,
        children: [node("paragraph", 1, 1, [])],
      },
    ]);

    parser.append(" hello");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 7,
        children: [node("paragraph", 2, 7, [node("text", 2, 7)])],
      },
    ]);
  });

  it("keeps correct offsets when blockquote prefix width varies by line", () => {
    const parser = new Parser("");
    parser.append("> a\n>b");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 6,
        children: [
          node("paragraph", 2, 6, [
            node("text", 2, 3),
            node("soft_break", 3, 5),
            node("text", 5, 6),
          ]),
        ],
      },
    ]);
  });
});
