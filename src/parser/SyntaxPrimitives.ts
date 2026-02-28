export type FenceHeader = {
  indent: string;
  marker: string;
  language: string | null;
  meta: string | null;
};

export function parseFenceHeader(line: string): FenceHeader | null {
  const match = line.match(/^(\s*)(`{3,}|~{3,})([^\s`~]*)?(?:\s+(.*))?$/);
  if (!match) {
    return null;
  }
  const indent = match[1] ?? "";
  const marker = match[2] ?? "```";
  const languageRaw = (match[3] ?? "").trim();
  const metaRaw = (match[4] ?? "").trim();
  return {
    indent,
    marker,
    language: languageRaw.length > 0 ? languageRaw : null,
    meta: metaRaw.length > 0 ? metaRaw : null,
  };
}

export function isFenceCloseLine(line: string, indent: string, marker: string): boolean {
  const withoutIndent = line.startsWith(indent) ? line.slice(indent.length) : line;
  if (marker.startsWith("`")) {
    return new RegExp(`^\`{${marker.length},}\\s*$`).test(withoutIndent);
  }
  return new RegExp(`^~{${marker.length},}\\s*$`).test(withoutIndent);
}

export type ParsedListMarker = {
  markerLength: number;
  isTask: boolean;
  checked: boolean;
  ordered: boolean;
  startNumber?: number;
};

export function isThematicBreakLine(line: string): boolean {
  const indent = countIndent(line);
  if (indent > 3) {
    return false;
  }

  const rest = line.slice(indent);
  let marker: "-" | "*" | "_" | null = null;
  let markerCount = 0;
  for (let i = 0; i < rest.length; i += 1) {
    const ch = rest[i] ?? "";
    if (ch === " " || ch === "\t") {
      continue;
    }
    if (ch !== "-" && ch !== "*" && ch !== "_") {
      return false;
    }
    if (marker === null) {
      marker = ch;
    } else if (marker !== ch) {
      return false;
    }
    markerCount += 1;
  }

  return markerCount >= 3;
}

export function parseListMarker(
  line: string,
  indent = 0,
  requireExactIndent = true,
  allowPartialOrdered = false,
): ParsedListMarker | null {
  const minimumLength = allowPartialOrdered ? indent + 1 : indent + 2;
  if (line.length < minimumLength) {
    return null;
  }
  if (requireExactIndent && countIndent(line) !== indent) {
    return null;
  }

  const rest = line.slice(indent);
  if (/^[-+*]\s/.test(rest)) {
    const todoMatch = rest.match(/^[-+*] \[( |x|X)\](?:\s|$)/);
    if (todoMatch) {
      const markerState = todoMatch[1] ?? " ";
      return {
        markerLength: todoMatch[0].length,
        isTask: true,
        checked: markerState.toLowerCase() === "x",
        ordered: false,
      };
    }

    return {
      markerLength: 2,
      isTask: false,
      checked: false,
      ordered: false,
    };
  }

  const orderedMatch = rest.match(/^(\d+)([.)])\s+/);
  if (orderedMatch) {
    const startNumber = Number.parseInt(orderedMatch[1] ?? "1", 10);
    return {
      markerLength: orderedMatch[0].length,
      isTask: false,
      checked: false,
      ordered: true,
      startNumber,
    };
  }

  if (!allowPartialOrdered) {
    return null;
  }

  // Optimistic ordered-list markers at end of stream:
  // "3", "3.", and "3)" should start an empty list item while typing.
  const orderedPartialMatch = rest.match(/^(\d+)([.)])?$/);
  if (!orderedPartialMatch) {
    return null;
  }

  const startNumber = Number.parseInt(orderedPartialMatch[1] ?? "1", 10);
  return {
    markerLength: orderedPartialMatch[0].length,
    isTask: false,
    checked: false,
    ordered: true,
    startNumber,
  };
}

export function splitTableSegments(
  line: string,
  isEscapedAt: (text: string, index: number) => boolean,
): Array<{ raw: string; start: number; end: number }> {
  let start = 0;
  let end = line.length;
  if (line.startsWith("|")) {
    start = 1;
  }
  if (end > start && line[end - 1] === "|" && !isEscapedAt(line, end - 1)) {
    end -= 1;
  }

  const segments: Array<{ raw: string; start: number; end: number }> = [];
  let segmentStart = start;
  for (let i = start; i < end; i += 1) {
    if (line[i] === "|" && !isEscapedAt(line, i)) {
      segments.push({
        raw: line.slice(segmentStart, i),
        start: segmentStart,
        end: i,
      });
      segmentStart = i + 1;
    }
  }
  segments.push({ raw: line.slice(segmentStart, end), start: segmentStart, end });
  return segments;
}

export function countIndent(line: string): number {
  let indent = 0;
  while (indent < line.length && line[indent] === " ") {
    indent += 1;
  }
  return indent;
}

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9A-Fa-f]+|[A-Za-z]+);/g, (entity, body: string) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      const code = Number.parseInt(body.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
    }
    if (body.startsWith("#")) {
      const code = Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
    }
    switch (body) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return '"';
      case "apos":
      case "#39":
        return "'";
      default:
        return entity;
    }
  });
}
