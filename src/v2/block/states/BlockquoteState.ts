import type { V2BlockState } from "./V2BlockState";

export function createBlockquoteState(
  line: string,
  lineStart: number,
  lineEnd: number,
): V2BlockState {
  return {
    kind: "blockquote",
    start: lineStart,
    end: lineEnd,
    lines: [line],
  };
}
