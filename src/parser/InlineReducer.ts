import type { AstNode } from "../types";

type InlineFrame = {
  type: "emphasis" | "strong";
  marker: "*" | "_" | "**" | "__";
  start: number;
  children: AstNode[];
};

export class InlineReducer {
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
          type: markerLength === 2 ? "strong" : "emphasis",
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
    if (
      hasClosedLabel &&
      nextIndex < text.length &&
      text[nextIndex] === "("
    ) {
      const destinationClose = text.indexOf(")", nextIndex + 1);
      nextIndex = destinationClose === -1 ? text.length : destinationClose + 1;
    }

    return {
      node: {
        type: "link",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        url: null,
        title: null,
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
    const closingTick = text.indexOf("`", startIndex + 1);
    const hasClosingTick = closingTick !== -1;
    const contentEnd = hasClosingTick ? closingTick : text.length;
    const nextIndex = hasClosingTick ? closingTick + 1 : text.length;

    return {
      node: {
        type: "code_span",
        start: absoluteStart + startIndex,
        end: absoluteStart + nextIndex,
        value: text.slice(startIndex + 1, contentEnd),
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
    const alt = text.slice(startIndex + 2, labelEndExclusive);

    let nextIndex = hasClosedLabel ? labelClose + 1 : text.length;
    let url: string | null = null;

    if (
      hasClosedLabel &&
      nextIndex < text.length &&
      text[nextIndex] === "("
    ) {
      const destinationClose = text.indexOf(")", nextIndex + 1);
      const destinationEnd =
        destinationClose === -1 ? text.length : destinationClose;
      url = text.slice(nextIndex + 1, destinationEnd);
      nextIndex = destinationClose === -1 ? text.length : destinationClose + 1;
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
      return null;
    }
    const raw = text.slice(startIndex + 1, close);
    if (!/^https?:\/\/[^\s>]+$/.test(raw)) {
      return null;
    }
    return {
      node: {
        type: "autolink",
        start: absoluteStart + startIndex,
        end: absoluteStart + close + 1,
        url: raw,
      },
      nextIndex: close + 1,
    };
  }

  private getEmphasisMarkerAt(
    text: string,
    pos: number,
  ): "*" | "_" | "**" | "__" | null {
    const next2 = text.slice(pos, pos + 2);
    if (next2 === "**" || next2 === "__") return next2;
    const next1 = text[pos];
    if (next1 === "*" || next1 === "_") return next1;
    return null;
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
}
