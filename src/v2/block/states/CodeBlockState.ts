import type { V2BlockState } from "./V2BlockState";

export function createCodeBlockState(
  line: string,
  lineStart: number,
  lineEnd: number,
): V2BlockState {
  const match = line.match(/^(\s*)(`{3,}|~{3,})([^\s`~]*)?(?:\s+(.*))?$/);
  return {
    kind: "code_block",
    start: lineStart,
    end: lineEnd,
    lines: [line],
    data: {
      indent: match?.[1] ?? "",
      marker: match?.[2] ?? "```",
      language: (match?.[3] ?? "").trim() || null,
      meta: (match?.[4] ?? "").trim() || null,
    },
  };
}
