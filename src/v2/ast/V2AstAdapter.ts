import type { AstNode } from "../../types";
import type { V2InternalNode } from "./V2AstBuilder";

export class V2AstAdapter {
  toAst(nodes: V2InternalNode[]): AstNode[] {
    return nodes.map((node) => this.mapNode(node));
  }

  private mapNode(node: V2InternalNode): AstNode {
    if (node.kind === "paragraph") {
      return {
        type: "paragraph",
        start: node.start,
        end: node.end,
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "heading") {
      const depth = Number(node.props?.depth ?? 1);
      const normalizedDepth = Math.min(6, Math.max(1, depth)) as 1 | 2 | 3 | 4 | 5 | 6;
      return {
        type: "heading",
        start: node.start,
        end: node.end,
        depth: normalizedDepth,
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "blockquote") {
      return {
        type: "blockquote",
        start: node.start,
        end: node.end,
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "list") {
      return {
        type: "list",
        start: node.start,
        end: node.end,
        ordered: Boolean(node.props?.ordered),
        tight: node.props?.tight !== false,
        startNumber:
          Boolean(node.props?.ordered) && Number.isFinite(Number(node.props?.startNumber))
            ? Number(node.props?.startNumber)
            : undefined,
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "list_item") {
      return {
        type: "list_item",
        start: node.start,
        end: node.end,
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "code_block") {
      return {
        type: "code_block",
        start: node.start,
        end: node.end,
        language: (node.props?.language as string | null | undefined) ?? null,
        meta: (node.props?.meta as string | null | undefined) ?? null,
        value: (node.props?.value as string | undefined) ?? "",
      };
    }
    if (node.kind === "table") {
      return {
        type: "table",
        start: node.start,
        end: node.end,
        align: ((node.props?.align as Array<"left" | "center" | "right" | null> | undefined) ??
          []),
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "table_row") {
      return {
        type: "table_row",
        start: node.start,
        end: node.end,
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "table_cell") {
      return {
        type: "table_cell",
        start: node.start,
        end: node.end,
        header: Boolean(node.props?.header),
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "emphasis") {
      return {
        type: "emphasis",
        start: node.start,
        end: node.end,
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "code_span") {
      return {
        type: "code_span",
        start: node.start,
        end: node.end,
        value: (node.props?.value as string | undefined) ?? "",
      };
    }
    if (node.kind === "link") {
      return {
        type: "link",
        start: node.start,
        end: node.end,
        url: (node.props?.url as string | null | undefined) ?? null,
        title: (node.props?.title as string | null | undefined) ?? null,
        children: (node.children ?? []).map((child) => this.mapNode(child)),
      };
    }
    if (node.kind === "image") {
      return {
        type: "image",
        start: node.start,
        end: node.end,
        url: (node.props?.url as string | null | undefined) ?? null,
        title: (node.props?.title as string | null | undefined) ?? null,
        alt: (node.props?.alt as string | undefined) ?? "",
      };
    }
    return {
      type: "text",
      start: node.start,
      end: node.end,
    };
  }
}
