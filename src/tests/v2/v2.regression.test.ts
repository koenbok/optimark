import { describe, expect, it } from "bun:test";
import { V2Parser } from "../../v2/V2Parser";

const topTypes = (input: string): string[] =>
  new V2Parser(input)
    .getLiveTree()
    .map((node) => node.type);

describe("V2 regression coverage", () => {
  it("does not throw on pathological unmatched bracket input", () => {
    const parser = new V2Parser("");
    const input = "[".repeat(100_000);
    expect(() => parser.append(input)).not.toThrow();
  });

  it("keeps fenced code open while streaming and closes when fence arrives", () => {
    const parser = new V2Parser("");
    parser.append("```ts\n");
    parser.append("const x = 1;\n");

    const open = parser.getLiveTree();
    expect(open).toHaveLength(1);
    expect(open[0]?.type).toBe("code_block");

    parser.append("```\n");
    const closed = parser.getLiveTree();
    expect(closed).toHaveLength(1);
    expect(closed[0]?.type).toBe("code_block");
  });

  it("recognizes lists, headings, blockquotes, and tables at top level", () => {
    expect(topTypes("# h")).toEqual(["heading"]);
    expect(topTypes("- a\n- b")).toEqual(["list"]);
    expect(topTypes("> a\n> b")).toEqual(["blockquote"]);
    expect(topTypes("| h |\n| --- |\n| a |")).toEqual(["table"]);
  });

  it("keeps committed blocks stable when appending new paragraph after boundary", () => {
    const parser = new V2Parser("alpha\n\n");
    const before = parser.getLiveTree();
    parser.append("beta");
    const after = parser.getLiveTree();

    expect(before[0]?.type).toBe("paragraph");
    expect(after[0]?.type).toBe("paragraph");
    expect(after[1]?.type).toBe("paragraph");
  });
});
