import type { V2BlockState } from "./V2BlockState";

export function createTableState(
  line: string,
  lineStart: number,
  lineEnd: number,
): V2BlockState {
  return {
    kind: "table",
    start: lineStart,
    end: lineEnd,
    lines: [line],
  };
}
