import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";
import { node } from "./helpers/ast";

describe("Parser.append optimistic partial syntax edges", () => {
  it("auto-closes unfinished emphasis markers", () => {
    const parser = new StreamingParser("");
    parser.append("*hel");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 4, [
        node("emphasis", 0, 4, [node("text", 1, 4)]),
      ]),
    ]);
  });

  it("auto-closes unfinished strong markers", () => {
    const parser = new StreamingParser("");
    parser.append("**hel");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [
        node("strong", 0, 5, [node("text", 2, 5)]),
      ]),
    ]);
  });

  it("keeps escaped emphasis opener as plain text", () => {
    const parser = new StreamingParser("");
    parser.append("\\*hel");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [node("text", 0, 5)]),
    ]);
  });

  it("promotes partial task marker to task item once it becomes valid", () => {
    const parser = new StreamingParser("");
    parser.append("- [");

    const firstPassTree = parser.getLiveTree();
    expect(firstPassTree).toHaveLength(1);
    expect(firstPassTree[0]?.type).toBe("list");
    expect(firstPassTree[0]?.children[0]?.type).toBe("list_item");

    parser.append(" ]");

    const secondPassTree = parser.getLiveTree();
    expect(secondPassTree).toHaveLength(1);
    expect(secondPassTree[0]?.type).toBe("list");
    expect(secondPassTree[0]?.children[0]?.type).toBe("task_item");
  });

  it("promotes a partial fence opener once the third backtick arrives", () => {
    const parser = new StreamingParser("");
    parser.append("``");
    expect(parser.getLiveTree()).toEqual([
      { type: "paragraph", start: 0, end: 2, children: [{ type: "code_span", start: 0, end: 2, value: "" }] },
    ]);

    parser.append("`");
    const tree = parser.getLiveTree();
    expect(tree).toHaveLength(1);
    expect(tree[0]?.type).toBe("code_block");
  });

  it("promotes a partial autolink when closing angle bracket arrives", () => {
    const parser = new StreamingParser("");
    parser.append("<https://example.com");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 20, [
        {
          type: "autolink",
          start: 0,
          end: 20,
          url: "https://example.com",
        },
      ]),
    ]);

    parser.append(">");
    const tree = parser.getLiveTree();
    expect(tree).toHaveLength(1);
    expect(tree[0]?.type).toBe("paragraph");
    expect(tree[0]?.children[0]).toMatchObject({
      type: "autolink",
      start: 0,
      end: 21,
      url: "https://example.com",
    });
  });

  it("promotes a partial html comment once closed", () => {
    const parser = new StreamingParser("");
    parser.append("<!-- hi");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 7, [
        {
          type: "html_inline",
          start: 0,
          end: 7,
          value: "<!-- hi",
        },
      ]),
    ]);

    parser.append("-->");
    const tree = parser.getLiveTree();
    expect(tree).toHaveLength(1);
    expect(tree[0]?.type).toBe("paragraph");
    expect(tree[0]?.children[0]).toMatchObject({
      type: "html_inline",
      start: 0,
      end: 10,
      value: "<!-- hi-->",
    });
  });

  it("consumes a reference definition once trailing quote arrives", () => {
    const parser = new StreamingParser("");
    parser.append('[id]: https://e.com "Ti');
    const initialTree = parser.getLiveTree();
    expect(initialTree).toHaveLength(1);
    expect(initialTree[0]?.type).toBe("paragraph");

    parser.append('"');
    expect(parser.getLiveTree()).toEqual([]);
  });

  it("keeps setext heading shape stable while underline grows incrementally", () => {
    const parser = new StreamingParser("");
    parser.append("Title\n--");
    const firstTree = parser.getLiveTree();
    expect(firstTree).toHaveLength(1);
    expect(firstTree[0]?.type).toBe("heading");
    if (firstTree[0]?.type === "heading") {
      expect(firstTree[0].depth).toBe(2);
    }

    parser.append("-");
    const secondTree = parser.getLiveTree();
    expect(secondTree).toHaveLength(1);
    expect(secondTree[0]?.type).toBe("heading");
    if (secondTree[0]?.type === "heading") {
      expect(secondTree[0].depth).toBe(2);
      expect(secondTree[0].children[0]?.type).toBe("text");
    }
  });

  it("reclassifies a setext-like tail into paragraph+list once item text arrives", () => {
    const parser = new StreamingParser("");
    parser.append("Title\n-");
    expect(parser.getLiveTree()).toEqual(new StreamingParser("Title\n-").getLiveTree());

    parser.append(" a");
    expect(parser.getLiveTree()).toEqual(new StreamingParser("Title\n- a").getLiveTree());
  });

  it("reclassifies when list marker space is present before item content arrives", () => {
    const parser = new StreamingParser("");
    parser.append("Title\n- ");
    expect(parser.getLiveTree()).toEqual(new StreamingParser("Title\n- ").getLiveTree());

    parser.append("item");
    expect(parser.getLiveTree()).toEqual(new StreamingParser("Title\n- item").getLiveTree());
  });

  it("upgrades thematic break when third marker arrives incrementally", () => {
    const parser = new StreamingParser("");
    parser.append("--");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 2, [node("text", 0, 2)]),
    ]);

    parser.append("-");
    expect(parser.getLiveTree()).toEqual([
      { type: "thematic_break", start: 0, end: 3 },
    ]);
  });
});
