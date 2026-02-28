import type { V2IndexedLine } from "./V2Types";

export class V2LineIndex {
  index(text: string, baseOffset: number): V2IndexedLine[] {
    const lines: V2IndexedLine[] = [];
    let cursor = 0;

    while (cursor <= text.length) {
      const lineEnd = text.indexOf("\n", cursor);
      if (lineEnd === -1) {
        lines.push({
          text: text.slice(cursor),
          start: baseOffset + cursor,
          end: baseOffset + text.length,
          terminated: false,
        });
        break;
      }

      lines.push({
        text: text.slice(cursor, lineEnd),
        start: baseOffset + cursor,
        end: baseOffset + lineEnd,
        terminated: true,
      });
      cursor = lineEnd + 1;
      if (cursor > text.length) {
        break;
      }
    }

    return lines;
  }
}
