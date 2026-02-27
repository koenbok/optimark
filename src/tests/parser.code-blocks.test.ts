import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

describe("Parser.append code blocks", () => {
  it("parses a fenced code block", () => {
    const parser = new StreamingParser("");
    parser.append("```\nconst x = 1;\n```");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "code_block",
        start: 0,
        end: 20,
        language: null,
        meta: null,
        value: "const x = 1;",
      },
    ]);
  });

  it("captures language and meta from opening fence", () => {
    const parser = new StreamingParser("");
    parser.append("```ts test=1\nx\n```");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "code_block",
        start: 0,
        end: 18,
        language: "ts",
        meta: "test=1",
        value: "x",
      },
    ]);
  });

  it("optimistically parses unfinished fenced code block", () => {
    const parser = new StreamingParser("");
    parser.append("```js\nlet a");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "code_block",
        start: 0,
        end: 11,
        language: "js",
        meta: null,
        value: "let a",
      },
    ]);
  });

  it("supports incremental growth and close of code fence", () => {
    const parser = new StreamingParser("");
    parser.append("```\na");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "code_block",
        start: 0,
        end: 5,
        language: null,
        meta: null,
        value: "a",
      },
    ]);

    parser.append("\n```");
    expect(parser.getLiveTree()).toEqual([
      {
        type: "code_block",
        start: 0,
        end: 9,
        language: null,
        meta: null,
        value: "a",
      },
    ]);
  });
});

describe("Parser.append code blocks in nested contexts", () => {
  it("parses fenced code block inside blockquote", () => {
    const parser = new StreamingParser("");
    parser.append("> ```\n> x\n> ```");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "blockquote",
        start: 0,
        end: 15,
        children: [
          {
            type: "code_block",
            start: 2,
            end: 15,
            language: null,
            meta: null,
            value: "x",
          },
        ],
      },
    ]);
  });

  it("parses fenced code block inside list item", () => {
    const parser = new StreamingParser("");
    parser.append("- ```\n  x\n  ```");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 15,
        ordered: false,
        tight: false,
        children: [
          {
            type: "list_item",
            start: 0,
            end: 15,
            children: [
              {
                type: "code_block",
                start: 2,
                end: 15,
                language: null,
                meta: null,
                value: "x",
              },
            ],
          },
        ],
      },
    ]);
  });
});
