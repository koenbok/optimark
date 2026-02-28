import type { AstNode } from "../types";
import { decodeHtmlEntities } from "./SyntaxPrimitives";

type InlineFrame = {
  type: "emphasis" | "strong" | "strikethrough";
  marker: "*" | "_" | "**" | "__" | "~~";
  start: number;
  children: AstNode[];
};

type ReferenceDefinition = {
  url: string | null;
  title: string | null;
};

export class InlineReducer {
  private readonly referenceDefinitions = new Map<string, ReferenceDefinition>();

  registerReferenceDefinition(
    label: string,
    url: string | null,
    title: string | null,
  ): void {
    const normalized = this.normalizeReferenceLabel(label);
    if (!normalized) return;
    this.referenceDefinitions.set(normalized, { url, title });
  }

  clearReferenceDefinitions(): void {
    this.referenceDefinitions.clear();
  }

  getPendingSuffixLength(text: string): number {
    if (!text) return 0;

    let pending = 0;
    const headingPrefix = text.match(/(?:^|\n)(#{1,6})$/);
    if (headingPrefix?.[1]) {
      pending = Math.max(pending, headingPrefix[1].length);
    }

    if (this.endsWithUnescapedSingleMarker(text, "*")) {
      pending = Math.max(pending, 1);
    }

    if (this.endsWithUnescapedSingleMarker(text, "_")) {
      pending = Math.max(pending, 1);
    }

    return pending;
  }

  parseInline(text: string, absoluteStart: number, allowLinks = true): AstNode[] {
    const root: AstNode[] = [];
    const stack: InlineFrame[] = [];
    let index = 0;
    const escapedAt = this.buildEscapedMap(text);

    const pushInto = (target: AstNode[], node: AstNode): void => {
      const last = target.at(-1);
      if (
        last &&
        last.type === "text" &&
        node.type === "text" &&
        last.end === node.start
      ) {
        target[target.length - 1] = {
          type: "text",
          start: last.start,
          end: node.end,
        };
        return;
      }
      target.push(node);
    };

    const pushNode = (node: AstNode): void => {
      const parent = stack.at(-1);
      if (parent) {
        pushInto(parent.children, node);
        return;
      }
      pushInto(root, node);
    };

    const isTokenStart = (pos: number): boolean => {
      if (pos >= text.length) return false;
      const char = text[pos];
      if (char === "\n") return true;
      if (char === "\\") return true;
      if (escapedAt[pos]) return false;
      if (allowLinks && (char === "[" || char === "<")) return true;
      if (char === "`") return true;
      if (allowLinks && char === "!" && pos + 1 < text.length && text[pos + 1] === "[") {
        return true;
      }
      return this.getEmphasisMarkerAt(text, pos) !== null;
    };

    const trimTrailingSpacesFromCurrentText = (count: number): void => {
      const parent = stack.at(-1);
      const target = parent ? parent.children : root;
      const last = target.at(-1);
      if (!last || last.type !== "text") {
        return;
      }
      const available = last.end - last.start;
      if (available <= count) {
        target.pop();
        return;
      }
      target[target.length - 1] = {
        type: "text",
        start: last.start,
        end: last.end - count,
      };
    };

    while (index < text.length) {
      if (text[index] === "\n") {
        const hasTwoSpaces =
          index >= 2 && text[index - 1] === " " && text[index - 2] === " ";
        if (hasTwoSpaces) {
          trimTrailingSpacesFromCurrentText(2);
          pushNode({
            type: "line_break",
            hard: true,
            start: absoluteStart + index - 2,
            end: absoluteStart + index + 1,
          });
        } else {
          pushNode({
            type: "soft_break",
            start: absoluteStart + index,
            end: absoluteStart + index + 1,
          });
        }
        index += 1;
        continue;
      }

      if (text[index] === "\\") {
        const isHardBreakSlash =
          index + 1 < text.length &&
          text[index + 1] === "\n" &&
          !escapedAt[index];
        if (isHardBreakSlash) {
          pushNode({
            type: "line_break",
            hard: true,
            start: absoluteStart + index,
            end: absoluteStart + index + 2,
          });
          index += 2;
          continue;
        }

        const nextIndex = Math.min(text.length, index + 2);
        pushNode({
          type: "text",
          start: absoluteStart + index,
          end: absoluteStart + nextIndex,
        });
        index = nextIndex;
        continue;
      }

      if (!escapedAt[index] && text[index] === "`") {
        const parsedCodeSpan = this.parseOptimisticCodeSpanAt(
          text,
          index,
          absoluteStart,
        );
        pushNode(parsedCodeSpan.node);
        index = parsedCodeSpan.nextIndex;
        continue;
      }

      if (
        allowLinks &&
        !escapedAt[index] &&
        text[index] === "!" &&
        index + 1 < text.length &&
        text[index + 1] === "["
      ) {
        const parsedImage = this.parseOptimisticImageAt(text, index, absoluteStart);
        pushNode(parsedImage.node);
        index = parsedImage.nextIndex;
        continue;
      }

      if (allowLinks && !escapedAt[index] && text[index] === "[") {
        const parsedLink = this.parseOptimisticLinkAt(text, index, absoluteStart);
        pushNode(parsedLink.node);
        index = parsedLink.nextIndex;
        continue;
      }

      if (allowLinks && !escapedAt[index] && text[index] === "<") {
        const parsedAutolink = this.parseAutolinkAt(text, index, absoluteStart);
        if (parsedAutolink) {
          pushNode(parsedAutolink.node);
          index = parsedAutolink.nextIndex;
          continue;
        }
        const parsedHtml = this.parseHtmlInlineAt(text, index, absoluteStart);
        if (parsedHtml) {
          pushNode(parsedHtml.node);
          index = parsedHtml.nextIndex;
          continue;
        }
        pushNode({
          type: "text",
          start: absoluteStart + index,
          end: absoluteStart + index + 1,
        });
        index += 1;
        continue;
      }

      const marker = !escapedAt[index]
        ? this.getEmphasisMarkerAt(text, index)
        : null;
      if (marker !== null) {
        const top = stack[stack.length - 1];
        const markerLength = marker.length;
        const markerStart = absoluteStart + index;

        if (top && top.marker === marker) {
          stack.pop();
          pushNode({
            type: top.type,
            start: top.start,
            end: markerStart + markerLength,
            children: top.children,
          });
          index += markerLength;
          continue;
        }

        stack.push({
          type:
            marker === "~~" ? "strikethrough" : markerLength === 2 ? "strong" : "emphasis",
          marker,
          start: markerStart,
          children: [],
        });
        index += markerLength;
        continue;
      }

      const runStart = index;
      while (index < text.length && !isTokenStart(index)) {
        index += 1;
      }

      pushNode({
        type: "text",
        start: absoluteStart + runStart,
        end: absoluteStart + index,
      });
    }

    while (stack.length > 0) {
      const frame = stack.pop() as InlineFrame;
      pushNode({
        type: frame.type,
        start: frame.start,
        end: absoluteStart + text.length,
        children: frame.children,
      });
    }

    return root;
  }

  private parseOptimisticLinkAt(
    text: string,
    startIndex: number,
    absoluteStart: number,
  ): { node: AstNode; nextIndex: number } {
    const labelClose = text.indexOf("]", startIndex + 1);
    const hasClosedLabel = labelClose !== -1;
    const labelEndExclusive = hasClosedLabel ? labelClose : text.length;
    const labelText = text.slice(startIndex + 1, labelEndExclusive);
    const labelChildren = this.parseInline(
      labelText,
      absoluteStart + startIndex + 1,
      false,
    );

    let nextIndex = hasClosedLabel ? labelClose + 1 : text.length;
    let url: string | null = null;
    let title: string | null = null;
    if (
      hasClosedLabel &&
      nextIndex < text.length &&
      text[nextIndex] === "("
    ) {
      const destinationClose = text.indexOf(")", nextIndex + 1);
      const destinationRaw =
        destinationClose === -1
          ? text.slice(nextIndex + 1)
          : text.slice(nextIndex + 1, destinationClose);
      const parsedDestination = this.parseInlineDestination(destinationRaw);
      url = parsedDestination.url;
      title = parsedDestination.title;
      nextIndex = destinationClose === -1 ? text.length : destinationClose + 1;
    } else if (
      hasClosedLabel &&
      nextIndex < text.length &&
      text[nextIndex] === "["
    ) {
      const referenceClose = text.indexOf("]", nextIndex + 1);
      if (referenceClose !== -1) {
        const referenceRaw = text.slice(nextIndex + 1, referenceClose);
        const definition = this.resolveReferenceDefinition(
          referenceRaw.length > 0 ? referenceRaw : labelText,
        );
        if (definition) {
          url = definition.url;
          title = definition.title;
        }
        nextIndex = referenceClose + 1;
      } else {
        nextIndex = text.length;
      }
    } else if (hasClosedLabel) {
      const definition = this.resolveReferenceDefinition(labelText);
      if (definition) {
        url = definition.url;
        title = definition.title;
      }
    }

    return {
      node: {
        type: "link",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        url,
        title,
        children: labelChildren,
      },
      nextIndex,
    };
  }

  private parseOptimisticCodeSpanAt(
    text: string,
    startIndex: number,
    absoluteStart: number,
  ): { node: AstNode; nextIndex: number } {
    const openingRun = this.countDelimiterRun(text, startIndex, "`");
    let closingStart = -1;
    let cursor = startIndex + openingRun;
    while (cursor < text.length) {
      if (text[cursor] !== "`") {
        cursor += 1;
        continue;
      }
      const runLength = this.countDelimiterRun(text, cursor, "`");
      if (runLength === openingRun) {
        closingStart = cursor;
        break;
      }
      cursor += runLength;
    }

    const hasClosingTick = closingStart !== -1;
    const contentEnd = hasClosingTick ? closingStart : text.length;
    const nextIndex = hasClosingTick ? closingStart + openingRun : text.length;

    return {
      node: {
        type: "code_span",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        value: text.slice(startIndex + openingRun, contentEnd),
      },
      nextIndex,
    };
  }

  private parseOptimisticImageAt(
    text: string,
    startIndex: number,
    absoluteStart: number,
  ): { node: AstNode; nextIndex: number } {
    const labelClose = text.indexOf("]", startIndex + 2);
    const hasClosedLabel = labelClose !== -1;
    const labelEndExclusive = hasClosedLabel ? labelClose : text.length;
    const alt = decodeHtmlEntities(text.slice(startIndex + 2, labelEndExclusive));

    let nextIndex = hasClosedLabel ? labelClose + 1 : text.length;
    let url: string | null = null;

    if (
      hasClosedLabel &&
      nextIndex < text.length &&
      text[nextIndex] === "("
    ) {
      const destinationClose = text.indexOf(")", nextIndex + 1);
      let title: string | null = null;
      if (destinationClose === -1) {
        url = decodeHtmlEntities(text.slice(nextIndex + 1));
      } else {
        const destinationRaw = text.slice(nextIndex + 1, destinationClose);
        const parsedDestination = this.parseInlineDestination(destinationRaw);
        url = parsedDestination.url;
        title = parsedDestination.title;
      }
      nextIndex = destinationClose === -1 ? text.length : destinationClose + 1;
      return {
        node: {
          type: "image",
          start: absoluteStart + startIndex,
          end: absoluteStart + nextIndex,
          url,
          title,
          alt,
        },
        nextIndex,
      };
    }

    if (
      hasClosedLabel &&
      nextIndex < text.length &&
      text[nextIndex] === "["
    ) {
      const referenceClose = text.indexOf("]", nextIndex + 1);
      if (referenceClose !== -1) {
        const referenceRaw = text.slice(nextIndex + 1, referenceClose);
        const definition = this.resolveReferenceDefinition(
          referenceRaw.length > 0 ? referenceRaw : alt,
        );
        nextIndex = referenceClose + 1;
        return {
          node: {
            type: "image",
            start: absoluteStart + startIndex,
            end: absoluteStart + nextIndex,
            url: definition?.url ?? null,
            title: definition?.title ?? null,
            alt,
          },
          nextIndex,
        };
      }
      nextIndex = text.length;
      return {
        node: {
          type: "image",
          start: absoluteStart + startIndex,
          end: absoluteStart + nextIndex,
          url,
          title: null,
          alt,
        },
        nextIndex,
      };
    }

    if (hasClosedLabel) {
      const definition = this.resolveReferenceDefinition(alt);
      if (definition) {
        url = definition.url;
      }
      return {
        node: {
          type: "image",
          start: absoluteStart + startIndex,
          end: absoluteStart + nextIndex,
          url,
          title: definition?.title ?? null,
          alt,
        },
        nextIndex,
      };
    }

    return {
      node: {
        type: "image",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        url,
        title: null,
        alt,
      },
      nextIndex,
    };
  }

  private parseAutolinkAt(
    text: string,
    startIndex: number,
    absoluteStart: number,
  ): { node: AstNode; nextIndex: number } | null {
    const close = text.indexOf(">", startIndex + 1);
    if (close === -1) {
      const partial = text.slice(startIndex + 1);
      if (/^https?:\/\/[^\s>]*$/i.test(partial)) {
        return {
          node: {
            type: "autolink",
            start: absoluteStart + startIndex,
            end: absoluteStart + text.length,
            url: decodeHtmlEntities(partial),
          },
          nextIndex: text.length,
        };
      }
      if (
        /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]*(?:\.[A-Za-z0-9-]*)*$/.test(
          partial,
        ) &&
        partial.includes("@")
      ) {
        return {
          node: {
            type: "autolink",
            start: absoluteStart + startIndex,
            end: absoluteStart + text.length,
            url: `mailto:${decodeHtmlEntities(partial)}`,
          },
          nextIndex: text.length,
        };
      }
      return null;
    }
    const raw = text.slice(startIndex + 1, close);
    if (/^https?:\/\/[^\s>]+$/i.test(raw)) {
      return {
        node: {
          type: "autolink",
          start: absoluteStart + startIndex,
          end: absoluteStart + close + 1,
          url: decodeHtmlEntities(raw),
        },
        nextIndex: close + 1,
      };
    }
    if (
      /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(
        raw,
      )
    ) {
      return {
        node: {
          type: "autolink",
          start: absoluteStart + startIndex,
          end: absoluteStart + close + 1,
          url: `mailto:${decodeHtmlEntities(raw)}`,
        },
        nextIndex: close + 1,
      };
    }
    return null;
  }

  private parseHtmlInlineAt(
    text: string,
    startIndex: number,
    absoluteStart: number,
  ): { node: AstNode; nextIndex: number } | null {
    const rest = text.slice(startIndex);
    if (rest.startsWith("<!--")) {
      const close = text.indexOf("-->", startIndex + 4);
      const nextIndex = close === -1 ? text.length : close + 3;
      return {
        node: {
          type: "html_inline",
          start: absoluteStart + startIndex,
          end: absoluteStart + nextIndex,
          value: text.slice(startIndex, nextIndex),
        },
        nextIndex,
      };
    }

    const match = rest.match(/^<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?>/);
    if (!match || !match[0]) {
      return null;
    }
    const nextIndex = startIndex + match[0].length;
    return {
      node: {
        type: "html_inline",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        value: decodeHtmlEntities(match[0]),
      },
      nextIndex,
    };
  }

  private getEmphasisMarkerAt(
    text: string,
    pos: number,
  ): "*" | "_" | "**" | "__" | "~~" | null {
    const next2 = text.slice(pos, pos + 2);
    if (next2 === "**" || next2 === "__" || next2 === "~~") return next2;
    const next1 = text[pos];
    if (next1 === "*" || next1 === "_") return next1;
    return null;
  }

  private countDelimiterRun(text: string, start: number, delimiter: string): number {
    let count = 0;
    while (start + count < text.length && text[start + count] === delimiter) {
      count += 1;
    }
    return count;
  }

  private buildEscapedMap(text: string): boolean[] {
    const escapedAt = new Array<boolean>(text.length).fill(false);
    let slashRun = 0;
    for (let i = 0; i < text.length; i += 1) {
      escapedAt[i] = slashRun % 2 === 1;
      if (text[i] === "\\") {
        slashRun += 1;
      } else {
        slashRun = 0;
      }
    }
    return escapedAt;
  }

  isEscapedAt(text: string, pos: number): boolean {
    let slashCount = 0;
    let cursor = pos - 1;
    while (cursor >= 0 && text[cursor] === "\\") {
      slashCount += 1;
      cursor -= 1;
    }
    return slashCount % 2 === 1;
  }

  private endsWithUnescapedSingleMarker(text: string, marker: "*" | "_"): boolean {
    if (!text.endsWith(marker)) return false;
    if (text.endsWith(marker + marker)) return false;
    return !this.isEscapedAt(text, text.length - 1);
  }

  private resolveReferenceDefinition(label: string): ReferenceDefinition | null {
    const normalized = this.normalizeReferenceLabel(label);
    if (!normalized) return null;
    return this.referenceDefinitions.get(normalized) ?? null;
  }

  private normalizeReferenceLabel(label: string): string {
    return label.replace(/\s+/g, " ").trim().toLowerCase();
  }

  private parseInlineDestination(raw: string): {
    url: string | null;
    title: string | null;
  } {
    const trimmed = raw.trim();
    if (!trimmed) return { url: null, title: null };

    const titleMatch = trimmed.match(
      /^(.*?)(?:\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\((?:[^)\\]|\\.)*\)))\s*$/,
    );
    const destinationRaw = (titleMatch?.[1] ?? trimmed).trim();
    const titleToken = titleMatch?.[2] ?? null;

    let destination = destinationRaw;
    if (destination.startsWith("<") && destination.endsWith(">")) {
      destination = destination.slice(1, -1).trim();
    }
    destination = destination.replace(
      /\\([\\`*{}\[\]()#+\-.!_<>~|])/g,
      "$1",
    );

    const parsedTitle = titleToken
      ? decodeHtmlEntities(
          titleToken.length >= 2 ? titleToken.slice(1, -1) : titleToken,
        )
      : null;
    return {
      url: destination.length > 0 ? decodeHtmlEntities(destination) : null,
      title: parsedTitle,
    };
  }
}
