import type { V2BlockState } from "./V2BlockState";

export function createParagraphState(
  line: string,
  lineStart: number,
  lineEnd: number,
): V2BlockState {
  return {
    kind: "paragraph",
    start: lineStart,
    end: lineEnd,
    lines: [line],
  };
}
