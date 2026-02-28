import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

describe("Parser state machine transitions", () => {
  it("transitions an active code block to full-parse close on fence", () => {
    const parser = new StreamingParser("");
    parser.append("```ts\nconst a = 1;");
    const openNode = parser.getLiveTree()[0];
    expect(openNode?.type).toBe("code_block");

    parser.append("\n```");
    const closedNode = parser.getLiveTree()[0];
    expect(closedNode?.type).toBe("code_block");
    expect(closedNode).not.toBe(openNode);
    if (!closedNode || closedNode.type !== "code_block") {
      throw new Error("expected closed code block node");
    }
    expect(closedNode.value).toBe("const a = 1;");
  });

  it("transitions out of list incremental state on non-list continuation", () => {
    const parser = new StreamingParser("");
    parser.append("- one\n");
    const openList = parser.getLiveTree()[0];
    expect(openList?.type).toBe("list");

    parser.append("tail");
    const tree = parser.getLiveTree();
    expect(tree.map((node) => node.type)).toEqual(["list", "paragraph"]);
    expect(tree[0]).not.toBe(openList);
  });

  it("transitions out of table incremental state on non-row continuation", () => {
    const parser = new StreamingParser("");
    parser.append("| h |\n| --- |\n");
    const openTable = parser.getLiveTree()[0];
    expect(openTable?.type).toBe("table");

    parser.append("tail");
    const chunked = parser.getLiveTree();
    const oneShot = new StreamingParser("| h |\n| --- |\ntail").getLiveTree();
    expect(chunked).toEqual(oneShot);
    expect(chunked[0]).not.toBe(openTable);
  });
});
