import type { AstNode } from "../../types";
import { decodeHtmlEntities } from "../core/V2TextUtils";

type ParsedInline = {
  node: AstNode;
  nextIndex: number;
};

export function parseInlineText(text: string, absoluteStart: number): AstNode[] {
  const nodes: AstNode[] = [];
  let i = 0;

  while (i < text.length) {
    const image = parseImage(text, i, absoluteStart);
    if (image) {
      nodes.push(image.node);
      i = image.nextIndex;
      continue;
    }

    const link = parseLink(text, i, absoluteStart);
    if (link) {
      nodes.push(link.node);
      i = link.nextIndex;
      continue;
    }

    const code = parseCodeSpan(text, i, absoluteStart);
    if (code) {
      nodes.push(code.node);
      i = code.nextIndex;
      continue;
    }

    const em = parseSimpleEmphasis(text, i, absoluteStart);
    if (em) {
      nodes.push(em.node);
      i = em.nextIndex;
      continue;
    }

    const start = i;
    i += 1;
    while (i < text.length) {
      if (text[i] === "!" || text[i] === "[" || text[i] === "`" || text[i] === "*") {
        break;
      }
      i += 1;
    }
    nodes.push({ type: "text", start: absoluteStart + start, end: absoluteStart + i });
  }

  return mergeText(nodes);
}

function parseImage(text: string, index: number, absoluteStart: number): ParsedInline | null {
  if (!text.startsWith("![", index)) return null;
  const close = text.indexOf("]", index + 2);
  if (close === -1) return null;
  const altRaw = text.slice(index + 2, close);
  let next = close + 1;
  if (next >= text.length || text[next] !== "(") return null;
  const destinationClose = text.indexOf(")", next + 1);
  if (destinationClose === -1) return null;
  const url = decodeHtmlEntities(text.slice(next + 1, destinationClose).trim());
  next = destinationClose + 1;
  return {
    node: {
      type: "image",
      start: absoluteStart + index,
      end: absoluteStart + next,
      url: url || null,
      title: null,
      alt: decodeHtmlEntities(altRaw),
    },
    nextIndex: next,
  };
}

function parseLink(text: string, index: number, absoluteStart: number): ParsedInline | null {
  if (text[index] !== "[") return null;
  const close = text.indexOf("]", index + 1);
  if (close === -1) return null;
  const label = text.slice(index + 1, close);
  let next = close + 1;
  if (next >= text.length || text[next] !== "(") return null;
  const destinationClose = text.indexOf(")", next + 1);
  if (destinationClose === -1) return null;
  const url = decodeHtmlEntities(text.slice(next + 1, destinationClose).trim());
  const children = parseInlineText(label, absoluteStart + index + 1);
  next = destinationClose + 1;
  return {
    node: {
      type: "link",
      start: absoluteStart + index,
      end: absoluteStart + next,
      url: url || null,
      title: null,
      children,
    },
    nextIndex: next,
  };
}

function parseCodeSpan(text: string, index: number, absoluteStart: number): ParsedInline | null {
  if (text[index] !== "`") return null;
  const close = text.indexOf("`", index + 1);
  if (close === -1) return null;
  return {
    node: {
      type: "code_span",
      start: absoluteStart + index,
      end: absoluteStart + close + 1,
      value: text.slice(index + 1, close),
    },
    nextIndex: close + 1,
  };
}

function parseSimpleEmphasis(text: string, index: number, absoluteStart: number): ParsedInline | null {
  if (text[index] !== "*") return null;
  const close = text.indexOf("*", index + 1);
  if (close === -1) return null;
  const children = parseInlineText(text.slice(index + 1, close), absoluteStart + index + 1);
  return {
    node: {
      type: "emphasis",
      start: absoluteStart + index,
      end: absoluteStart + close + 1,
      children,
    },
    nextIndex: close + 1,
  };
}

function mergeText(nodes: AstNode[]): AstNode[] {
  const merged: AstNode[] = [];
  for (const node of nodes) {
    const last = merged.at(-1);
    if (last?.type === "text" && node.type === "text" && last.end === node.start) {
      merged[merged.length - 1] = { type: "text", start: last.start, end: node.end };
      continue;
    }
    merged.push(node);
  }
  return merged;
}
