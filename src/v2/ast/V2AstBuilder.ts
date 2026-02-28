import type { AstNode } from "../../types";
import type { V2Block } from "../core/V2Types";
import type { V2InlineResult } from "../inline/V2InlineMachine";

export type V2InternalNode = {
  kind:
    | "paragraph"
    | "heading"
    | "blockquote"
    | "list"
    | "list_item"
    | "code_block"
    | "table"
    | "table_row"
    | "table_cell"
    | "text"
    | "emphasis"
    | "code_span"
    | "link"
    | "image";
  start: number;
  end: number;
  props?: Record<string, unknown>;
  children?: V2InternalNode[];
};

export class V2AstBuilder {
  build(blocks: V2Block[], inlineResults: V2InlineResult[]): V2InternalNode[] {
    const inlineByBlockId = new Map<number, AstNode[]>();
    for (const result of inlineResults) {
      inlineByBlockId.set(result.blockId, result.children);
    }

    return blocks.map((block) => {
      if (block.kind === "heading") {
        return {
          kind: "heading",
          start: block.start,
          end: block.end,
          props: { depth: Number(block.data?.depth ?? 1) },
          children: mapInline(inlineByBlockId.get(block.id) ?? []),
        };
      }

      if (block.kind === "blockquote") {
        return {
          kind: "blockquote",
          start: block.start,
          end: block.end,
          children: [
            {
              kind: "paragraph",
              start: block.start,
              end: block.end,
              children: mapInline(inlineByBlockId.get(block.id) ?? []),
            },
          ],
        };
      }

      if (block.kind === "list") {
        return buildListNode(block);
      }

      if (block.kind === "code_block") {
        const lines = block.raw.split("\n");
        const fenceStart = lines[0] ?? "";
        const language =
          String(block.data?.language ?? "").trim() ||
          String(fenceStart.match(/^(\s*)(`{3,}|~{3,})([^\s`~]*)/)?.[3] ?? "").trim() ||
          null;
        const meta =
          String(block.data?.meta ?? "").trim() ||
          String(fenceStart.match(/^(\s*)(`{3,}|~{3,})([^\s`~]*)\s+(.*)$/)?.[4] ?? "").trim() ||
          null;
        const value = lines.slice(1, Math.max(1, lines.length - 1)).join("\n");
        return {
          kind: "code_block",
          start: block.start,
          end: block.end,
          props: { language, meta, value },
        };
      }

      if (block.kind === "table") {
        return buildTableNode(block);
      }

      return {
        kind: "paragraph",
        start: block.start,
        end: block.end,
        children: mapInline(inlineByBlockId.get(block.id) ?? []),
      };
    });
  }
}

function buildListNode(block: V2Block): V2InternalNode {
  const lines = block.raw.split("\n").filter((line) => line.trim().length > 0);
  const ordered = Boolean(block.data?.ordered);
  const startNumber =
    ordered && Number.isFinite(Number(block.data?.startNumber))
      ? Number(block.data?.startNumber)
      : 1;
  let offsetCursor = block.start;
  const items: V2InternalNode[] = [];

  for (const line of lines) {
    const itemStart = offsetCursor;
    const content = line.replace(/^\s*(?:[-+*]|\d{1,9}[.)])\s+/, "");
    const itemEnd = itemStart + line.length;
    const contentStart = itemStart + (line.length - content.length);
    items.push({
      kind: "list_item",
      start: itemStart,
      end: itemEnd,
      children: [
        {
          kind: "paragraph",
          start: contentStart,
          end: itemEnd,
          children: [{ kind: "text", start: contentStart, end: itemEnd }],
        },
      ],
    });
    offsetCursor += line.length + 1;
  }

  return {
    kind: "list",
    start: block.start,
    end: block.end,
    props: { ordered, tight: true, startNumber },
    children: items,
  };
}

function buildTableNode(block: V2Block): V2InternalNode {
  const lines = block.raw.split("\n").filter((line) => line.trim().length > 0);
  const header = lines[0] ?? "";
  const body = lines.slice(2);
  const align = splitTableRow(lines[1] ?? "").map((cell) => parseAlign(cell));

  const rows: V2InternalNode[] = [];
  const headerCells = splitTableRow(header);
  rows.push({
    kind: "table_row",
    start: block.start,
    end: block.start + header.length,
    children: headerCells.map((cell, idx) => ({
      kind: "table_cell",
      start: block.start + idx,
      end: block.start + idx + cell.length,
      props: { header: true },
      children: [{ kind: "text", start: block.start + idx, end: block.start + idx + cell.length }],
    })),
  });

  let cursor = block.start + (lines[0]?.length ?? 0) + 1 + (lines[1]?.length ?? 0) + 1;
  for (const rowLine of body) {
    const cells = splitTableRow(rowLine);
    rows.push({
      kind: "table_row",
      start: cursor,
      end: cursor + rowLine.length,
      children: cells.map((cell, idx) => ({
        kind: "table_cell",
        start: cursor + idx,
        end: cursor + idx + cell.length,
        props: { header: false },
        children: [{ kind: "text", start: cursor + idx, end: cursor + idx + cell.length }],
      })),
    });
    cursor += rowLine.length + 1;
  }

  return {
    kind: "table",
    start: block.start,
    end: block.end,
    props: { align },
    children: rows,
  };
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseAlign(segment: string): "left" | "center" | "right" | null {
  const trimmed = segment.trim();
  const left = trimmed.startsWith(":");
  const right = trimmed.endsWith(":");
  if (left && right) return "center";
  if (left) return "left";
  if (right) return "right";
  return null;
}

function mapInline(nodes: AstNode[]): V2InternalNode[] {
  return nodes.map((node) => {
    if (node.type === "text") {
      return { kind: "text", start: node.start, end: node.end };
    }
    if (node.type === "emphasis") {
      return {
        kind: "emphasis",
        start: node.start,
        end: node.end,
        children: mapInline(node.children),
      };
    }
    if (node.type === "code_span") {
      return {
        kind: "code_span",
        start: node.start,
        end: node.end,
        props: { value: node.value },
      };
    }
    if (node.type === "link") {
      return {
        kind: "link",
        start: node.start,
        end: node.end,
        props: { url: node.url, title: node.title },
        children: mapInline(node.children),
      };
    }
    if (node.type === "image") {
      return {
        kind: "image",
        start: node.start,
        end: node.end,
        props: { url: node.url, title: node.title, alt: node.alt },
      };
    }
    return { kind: "text", start: node.start, end: node.end };
  });
}
