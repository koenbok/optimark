import type { AstNode, NodeType } from "../../types";

export const node = (
  type: NodeType,
  start: number,
  end: number,
  children?: AstNode[],
): AstNode => {
  switch (type) {
    case "heading":
      return { type: "heading", start, end, depth: 1, children: children ?? [] };
    case "list":
      return {
        type: "list",
        start,
        end,
        ordered: false,
        tight: false,
        children: children ?? [],
      };
    case "list_item":
      return { type: "list_item", start, end, children: children ?? [] };
    case "task_item":
      return { type: "task_item", start, end, checked: false, children: children ?? [] };
    case "link":
      return { type: "link", start, end, url: null, title: null, children: children ?? [] };
    case "image":
      return { type: "image", start, end, url: null, title: null, alt: "" };
    case "code_block":
      return { type: "code_block", start, end, language: null, meta: null, value: "" };
    case "html_block":
      return { type: "html_block", start, end, value: "" };
    case "html_inline":
      return { type: "html_inline", start, end, value: "" };
    case "table":
      return { type: "table", start, end, align: [], children: children ?? [] };
    case "table_row":
      return { type: "table_row", start, end, children: children ?? [] };
    case "table_cell":
      return { type: "table_cell", start, end, header: false, children: children ?? [] };
    case "code_span":
      return { type: "code_span", start, end, value: "" };
    case "autolink":
      return { type: "autolink", start, end, url: "" };
    case "line_break":
      return { type: "line_break", start, end, hard: true };
    case "document":
      return { type: "document", start, end, children: children ?? [] };
    case "paragraph":
      return { type: "paragraph", start, end, children: children ?? [] };
    case "blockquote":
      return { type: "blockquote", start, end, children: children ?? [] };
    case "emphasis":
      return { type: "emphasis", start, end, children: children ?? [] };
    case "strong":
      return { type: "strong", start, end, children: children ?? [] };
    case "strikethrough":
      return { type: "strikethrough", start, end, children: children ?? [] };
    case "thematic_break":
      return { type: "thematic_break", start, end };
    case "text":
      return { type: "text", start, end };
    case "soft_break":
      return { type: "soft_break", start, end };
  }
};
