export type NodeType =
  | "document"
  | "paragraph"
  | "heading"
  | "blockquote"
  | "list"
  | "list_item"
  | "task_item"
  | "thematic_break"
  | "code_block"
  | "html_block"
  | "table"
  | "table_row"
  | "table_cell"
  | "text"
  | "emphasis"
  | "strong"
  | "strikethrough"
  | "code_span"
  | "link"
  | "image"
  | "autolink"
  | "html_inline"
  | "line_break"
  | "soft_break";

type BaseNode = {
  start: number;
  end: number;
};

export type DocumentNode = BaseNode & {
  type: "document";
  children: AstNode[];
};

export type ParagraphNode = BaseNode & {
  type: "paragraph";
  children: AstNode[];
};

export type HeadingNode = BaseNode & {
  type: "heading";
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: AstNode[];
};

export type BlockquoteNode = BaseNode & {
  type: "blockquote";
  children: AstNode[];
};

export type ListNode = BaseNode & {
  type: "list";
  ordered: boolean;
  tight: boolean;
  startNumber?: number;
  children: AstNode[];
};

export type ListItemNode = BaseNode & {
  type: "list_item";
  children: AstNode[];
};

export type TaskItemNode = BaseNode & {
  type: "task_item";
  checked: boolean;
  children: AstNode[];
};

export type ThematicBreakNode = BaseNode & {
  type: "thematic_break";
};

export type CodeBlockNode = BaseNode & {
  type: "code_block";
  language: string | null;
  meta: string | null;
  value: string;
};

export type HtmlBlockNode = BaseNode & {
  type: "html_block";
  value: string;
};

export type TableNode = BaseNode & {
  type: "table";
  align: Array<"left" | "center" | "right" | null>;
  children: AstNode[];
};

export type TableRowNode = BaseNode & {
  type: "table_row";
  children: AstNode[];
};

export type TableCellNode = BaseNode & {
  type: "table_cell";
  header: boolean;
  children: AstNode[];
};

export type TextNode = BaseNode & {
  type: "text";
};

export type EmphasisNode = BaseNode & {
  type: "emphasis";
  children: AstNode[];
};

export type StrongNode = BaseNode & {
  type: "strong";
  children: AstNode[];
};

export type StrikethroughNode = BaseNode & {
  type: "strikethrough";
  children: AstNode[];
};

export type CodeSpanNode = BaseNode & {
  type: "code_span";
  value: string;
};

export type LinkNode = BaseNode & {
  type: "link";
  url: string | null;
  title: string | null;
  children: AstNode[];
};

export type ImageNode = BaseNode & {
  type: "image";
  url: string | null;
  title: string | null;
  alt: string;
};

export type AutolinkNode = BaseNode & {
  type: "autolink";
  url: string;
};

export type HtmlInlineNode = BaseNode & {
  type: "html_inline";
  value: string;
};

export type LineBreakNode = BaseNode & {
  type: "line_break";
  hard: boolean;
};

export type SoftBreakNode = BaseNode & {
  type: "soft_break";
};

export type AstNode =
  | DocumentNode
  | ParagraphNode
  | HeadingNode
  | BlockquoteNode
  | ListNode
  | ListItemNode
  | TaskItemNode
  | ThematicBreakNode
  | CodeBlockNode
  | HtmlBlockNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | TextNode
  | EmphasisNode
  | StrongNode
  | StrikethroughNode
  | CodeSpanNode
  | LinkNode
  | ImageNode
  | AutolinkNode
  | HtmlInlineNode
  | LineBreakNode
  | SoftBreakNode;
