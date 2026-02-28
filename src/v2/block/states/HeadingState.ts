import type { V2BlockState } from "./V2BlockState";

export function createHeadingState(
  line: string,
  lineStart: number,
  lineEnd: number,
): V2BlockState {
  const depth = Math.min(6, line.match(/^#{1,6}/)?.[0]?.length ?? 1);
  return {
    kind: "heading",
    start: lineStart,
    end: lineEnd,
    lines: [line],
    data: { depth },
  };
}
