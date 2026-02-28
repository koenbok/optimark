const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

export function decodeHtmlEntities(input: string): string {
  if (!input.includes("&")) return input;
  return input.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]+);/g, (m, body) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      const value = Number.parseInt(body.slice(2), 16);
      if (!Number.isFinite(value)) return m;
      return String.fromCodePoint(value);
    }
    if (body.startsWith("#")) {
      const value = Number.parseInt(body.slice(1), 10);
      if (!Number.isFinite(value)) return m;
      return String.fromCodePoint(value);
    }
    return NAMED_ENTITIES[body] ?? m;
  });
}
