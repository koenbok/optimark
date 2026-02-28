import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

describe("Parser regression: fenced code commit boundaries", () => {
  it("does not split on blank lines inside fenced code", () => {
    const parser = new StreamingParser("");
    parser.append("```\na\n\nb\n```");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "code_block",
        start: 0,
        end: 12,
        language: null,
        meta: null,
        value: "a\n\nb",
      },
    ]);
  });
});

describe("Parser regression: trailing content preservation", () => {
  it("keeps trailing text after a closed fence in same append", () => {
    const parser = new StreamingParser("");
    parser.append("```\na\n```\ntext");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "code_block",
        start: 0,
        end: 9,
        language: null,
        meta: null,
        value: "a",
      },
      {
        type: "paragraph",
        start: 10,
        end: 14,
        children: [{ type: "text", start: 10, end: 14 }],
      },
    ]);
  });

  it("keeps trailing lines after a table block", () => {
    const parser = new StreamingParser("");
    parser.append("| h |\n| --- |\n| a |\ntail\n\n");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "table",
        start: 0,
        end: 19,
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
                children: [{ type: "text", start: 2, end: 3 }],
              },
            ],
          },
          {
            type: "table_row",
            start: 14,
            end: 19,
            children: [
              {
                type: "table_cell",
                header: false,
                start: 16,
                end: 17,
                children: [{ type: "text", start: 16, end: 17 }],
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        start: 20,
        end: 24,
        children: [{ type: "text", start: 20, end: 24 }],
      },
    ]);
  });
});

describe("Parser regression: constructor and append parity", () => {
  it("matches constructor and append output for multi-block input", () => {
    const text = "a\n\nb";
    const constructorParser = new StreamingParser(text);
    const appendParser = new StreamingParser("");
    appendParser.append(text);

    expect(constructorParser.getLiveTree()).toEqual(appendParser.getLiveTree());
  });
});

describe("Parser regression: malformed link depth", () => {
  it("does not stack overflow on long unmatched link openers", () => {
    const parser = new StreamingParser("");
    const input = "[".repeat(20_000);

    expect(() => parser.append(input)).not.toThrow();
    expect(parser.getLiveTree().length).toBeGreaterThan(0);
  });
});

describe("Parser regression: incremental active-tail reuse", () => {
  it("reuses open code_block node while appending content lines", () => {
    const parser = new StreamingParser("");
    parser.append("```ts\n");
    const initialNode = parser.getLiveTree()[0];
    expect(initialNode?.type).toBe("code_block");

    parser.append("const a = 1;\n");
    const afterAppendNode = parser.getLiveTree()[0];
    expect(afterAppendNode).toBe(initialNode);
    expect(afterAppendNode).toEqual({
      type: "code_block",
      start: 0,
      end: 19,
      language: "ts",
      meta: null,
      value: "const a = 1;\n",
    });
  });

  it("reuses list node while appending sibling items", () => {
    const parser = new StreamingParser("");
    parser.append("- one\n");
    const initialNode = parser.getLiveTree()[0];
    expect(initialNode?.type).toBe("list");

    parser.append("- two\n");
    const afterAppendNode = parser.getLiveTree()[0];
    expect(afterAppendNode).toBe(initialNode);
    expect(afterAppendNode?.type).toBe("list");
    if (!afterAppendNode || afterAppendNode.type !== "list") {
      throw new Error("expected list node");
    }
    expect(afterAppendNode.children.length).toBe(2);
  });

  it("reuses table node while appending body rows", () => {
    const parser = new StreamingParser("");
    parser.append("| h1 | h2 |\n| --- | --- |\n");
    const initialNode = parser.getLiveTree()[0];
    expect(initialNode?.type).toBe("table");

    parser.append("| a | b |\n");
    const afterAppendNode = parser.getLiveTree()[0];
    expect(afterAppendNode).toBe(initialNode);
    expect(afterAppendNode?.type).toBe("table");
    if (!afterAppendNode || afterAppendNode.type !== "table") {
      throw new Error("expected table node");
    }
    expect(afterAppendNode.children.length).toBe(2);
  });
});
