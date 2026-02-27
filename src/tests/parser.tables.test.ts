import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

describe("Parser.append tables", () => {
  it("parses a basic table (header, delimiter, one body row)", () => {
    const parser = new StreamingParser("");
    parser.append("| h1 | h2 |\n| --- | --- |\n| a | b |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "table",
        start: 0,
        align: [null, null],
        children: [
          {
            type: "table_row",
            children: [
              {
                type: "table_cell",
                header: true,
                children: [{ type: "text" }],
              },
              {
                type: "table_cell",
                header: true,
                children: [{ type: "text" }],
              },
            ],
          },
          {
            type: "table_row",
            children: [
              {
                type: "table_cell",
                header: false,
                children: [{ type: "text" }],
              },
              {
                type: "table_cell",
                header: false,
                children: [{ type: "text" }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("parses column alignment from delimiter row", () => {
    const parser = new StreamingParser("");
    parser.append("| a | b | c | d |\n| :--- | :---: | ---: | --- |\n| 1 | 2 | 3 | 4 |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "table",
        align: ["left", "center", "right", null],
      },
    ]);
  });

  it("optimistically treats partial delimiter row as a table in progress", () => {
    const parser = new StreamingParser("");
    parser.append("| h |\n| -");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "table",
        children: [
          {
            type: "table_row",
            children: [{ type: "table_cell", header: true }],
          },
        ],
      },
    ]);
  });

  it("optimistically parses partial body row (missing trailing pipe)", () => {
    const parser = new StreamingParser("");
    parser.append("| h1 | h2 |\n| --- | --- |\n| a | b");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "table",
        children: [
          { type: "table_row" },
          {
            type: "table_row",
            children: [
              { type: "table_cell", header: false },
              { type: "table_cell", header: false },
            ],
          },
        ],
      },
    ]);
  });

  it("parses a table inside blockquote", () => {
    const parser = new StreamingParser("");
    parser.append("> | h |\n> | --- |\n> | x |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "blockquote",
        children: [{ type: "table" }],
      },
    ]);
  });

  it("parses a table inside list item continuation", () => {
    const parser = new StreamingParser("");
    parser.append("- | h |\n  | --- |\n  | x |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "list",
        children: [
          {
            type: "list_item",
            children: [{ type: "table" }],
          },
        ],
      },
    ]);
  });

  it("parses inline formatting inside table cells", () => {
    const parser = new StreamingParser("");
    parser.append("| h |\n| --- |\n| **x** [y](z) |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "table",
        children: [
          { type: "table_row" },
          {
            type: "table_row",
            children: [
              {
                type: "table_cell",
                children: [{ type: "strong" }, { type: "text" }, { type: "link" }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("supports table syntax without outer pipes", () => {
    const parser = new StreamingParser("");
    parser.append("h1 | h2\n--- | ---\na | b");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "table",
        align: [null, null],
      },
    ]);
  });

  it("does not parse as table when delimiter row is missing", () => {
    const parser = new StreamingParser("");
    parser.append("| h1 | h2 |\n| a | b |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "paragraph",
      },
    ]);
  });

  it("pads missing body cells to header width", () => {
    const parser = new StreamingParser("");
    parser.append("| h1 | h2 | h3 |\n| --- | --- | --- |\n| a | b |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "table",
        children: [
          { type: "table_row" },
          {
            type: "table_row",
            children: [
              { type: "table_cell", header: false },
              { type: "table_cell", header: false },
              { type: "table_cell", header: false },
            ],
          },
        ],
      },
    ]);
  });

  it("clamps extra body cells to header width", () => {
    const parser = new StreamingParser("");
    parser.append("| h1 | h2 |\n| --- | --- |\n| a | b | c |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "table",
        children: [
          { type: "table_row" },
          {
            type: "table_row",
            children: [
              { type: "table_cell", header: false },
              { type: "table_cell", header: false },
            ],
          },
        ],
      },
    ]);
  });

  it("keeps escaped pipes inside a cell as content", () => {
    const parser = new StreamingParser("");
    parser.append("| h |\n| --- |\n| a \\| b |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "table",
        children: [
          { type: "table_row" },
          {
            type: "table_row",
            children: [{ type: "table_cell", children: [{ type: "text" }] }],
          },
        ],
      },
    ]);
  });

  it("parses a table inside task item continuation", () => {
    const parser = new StreamingParser("");
    parser.append("- [ ] t\n  | h |\n  | --- |\n  | x |");

    expect(parser.getLiveTree()).toMatchObject([
      {
        type: "list",
        children: [
          {
            type: "task_item",
            children: [{ type: "paragraph" }, { type: "table" }],
          },
        ],
      },
    ]);
  });
});
