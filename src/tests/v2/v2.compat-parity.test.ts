import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../../StreamingParser";
import { V2Parser } from "../../v2/V2Parser";
import type { AstNode } from "../../types";

type Normalized = {
  type: string;
  depth?: number;
  ordered?: boolean;
  children?: Normalized[];
};

const normalize = (nodes: AstNode[]): Normalized[] =>
  compact(
    nodes
    .filter((node) => node.type !== "soft_break" && node.type !== "line_break")
    .map((node) => {
    if ("children" in node && Array.isArray(node.children)) {
      return {
        type: node.type,
        depth: "depth" in node ? node.depth : undefined,
        ordered: "ordered" in node ? node.ordered : undefined,
        children: normalize(node.children),
      };
    }
    return {
      type: node.type,
      depth: "depth" in node ? node.depth : undefined,
      ordered: "ordered" in node ? node.ordered : undefined,
    };
  }),
  );

const compact = (nodes: Normalized[]): Normalized[] => {
  const compacted: Normalized[] = [];
  for (const node of nodes) {
    const last = compacted.at(-1);
    if (last?.type === "text" && node.type === "text") {
      continue;
    }
    compacted.push(
      node.children ? { ...node, children: compact(node.children) } : node,
    );
  }
  return compacted;
};

const parseBoth = (input: string) => ({
  current: normalize(new StreamingParser(input).getLiveTree()),
  v2: normalize(new V2Parser(input).getLiveTree()),
});

describe("V2 soft compatibility parity", () => {
  const corpus = [
    "plain text",
    "# title",
    "a\n\nb",
    "- one\n- two",
    "1. one\n2. two",
    "> quote\n> nested",
    "```ts\nconst x = 1;\n```",
    "| h1 | h2 |\n| --- | --- |\n| a | b |",
  ];

  it("matches top-level node shapes on representative corpus", () => {
    for (const input of corpus) {
      const { current, v2 } = parseBoth(input);
      expect(v2).toEqual(current);
    }
  });
});
