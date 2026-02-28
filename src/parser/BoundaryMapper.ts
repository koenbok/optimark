import type { AstNode } from "../types";

export function remapNodePositions(node: AstNode, boundaryMap: number[]): AstNode {
  const start = boundaryMap[node.start] ?? node.start;
  const end = boundaryMap[node.end] ?? node.end;
  const children =
    "children" in node && Array.isArray(node.children)
      ? node.children.map((child: AstNode) => remapNodePositions(child, boundaryMap))
      : undefined;
  return {
    ...node,
    start,
    end,
    ...(children ? { children } : {}),
  };
}

export function buildBlockquoteBoundaryMap(
  lines: string[],
  lineOffsets: number[],
  prefixLengths: number[],
  absoluteStart: number,
  innerLength: number,
): number[] {
  const map = new Array<number>(innerLength + 1).fill(absoluteStart);
  let innerPos = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const lineStart = lineOffsets[i] ?? 0;
    const prefixLength = prefixLengths[i] ?? 0;
    const stripped = line.slice(prefixLength);

    map[innerPos] = absoluteStart + lineStart + prefixLength;

    for (let k = 0; k < stripped.length; k += 1) {
      innerPos += 1;
      map[innerPos] = absoluteStart + lineStart + prefixLength + k + 1;
    }

    if (i < lines.length - 1) {
      innerPos += 1;
    }
  }

  return map;
}

export function buildBoundaryMapForStrippedLines(
  lines: string[],
  lineStarts: number[],
  stripLengths: number[],
  innerLength: number,
): number[] {
  const map = new Array<number>(innerLength + 1).fill(0);
  let innerPos = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const lineStart = lineStarts[i] ?? 0;
    const strip = stripLengths[i] ?? 0;
    const stripped = line.slice(strip);
    const contentStart = lineStart + strip;

    map[innerPos] = contentStart;
    for (let k = 0; k < stripped.length; k += 1) {
      innerPos += 1;
      map[innerPos] = contentStart + k + 1;
    }

    if (i < lines.length - 1) {
      innerPos += 1;
    }
  }

  return map;
}
