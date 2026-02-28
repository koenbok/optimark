import type { V2BlockState } from "./V2BlockState";

export function createListState(
  line: string,
  lineStart: number,
  lineEnd: number,
): V2BlockState {
  const ordered = /^\s*\d{1,9}[.)]\s+/.test(line);
  const marker = line.match(/^\s*(?:[-+*]|\d{1,9}[.)])\s+/)?.[0] ?? "";
  const startNumber = ordered
    ? Number.parseInt(line.match(/^\s*(\d{1,9})[.)]\s+/)?.[1] ?? "1", 10)
    : undefined;
  return {
    kind: "list",
    start: lineStart,
    end: lineEnd,
    lines: [line],
    data: { ordered, marker, startNumber },
  };
}
