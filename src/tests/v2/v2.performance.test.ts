import { describe, expect, it } from "bun:test";
import { V2Parser } from "../../v2/V2Parser";

const measureMs = (fn: () => void, runs = 1): number => {
  let total = 0;
  for (let i = 0; i < runs; i += 1) {
    const start = performance.now();
    fn();
    total += performance.now() - start;
  }
  return total / runs;
};

const appendCharByChar = (count: number): void => {
  const parser = new V2Parser("");
  const text = "a".repeat(count);
  for (let i = 0; i < text.length; i += 1) {
    parser.append(text[i] ?? "");
  }
};

const appendOpenFenceLines = (count: number): void => {
  const parser = new V2Parser("");
  parser.append("```ts\n");
  for (let i = 0; i < count; i += 1) {
    parser.append(`line ${i}\n`);
  }
};

const appendListItems = (count: number): void => {
  const parser = new V2Parser("");
  for (let i = 0; i < count; i += 1) {
    parser.append(`- item ${i}\n`);
  }
};

const appendTableRows = (count: number): void => {
  const parser = new V2Parser("");
  parser.append("| h1 | h2 |\n| --- | --- |\n");
  for (let i = 0; i < count; i += 1) {
    parser.append(`| ${i} | ${i + 1} |\n`);
  }
};

describe("V2 performance guardrails", () => {
  it("remains bounded for large char-by-char append workloads", () => {
    const elapsed = measureMs(() => appendCharByChar(20_000), 1);
    expect(elapsed).toBeLessThan(7_000);
  });

  it("keeps scaling broad-linear for open-fence line growth", () => {
    const t1k = measureMs(() => appendOpenFenceLines(1_000), 1);
    const t2k = measureMs(() => appendOpenFenceLines(2_000), 1);
    expect(t2k / Math.max(t1k, 0.1)).toBeLessThan(12);
  });

  it("keeps list growth bounded", () => {
    const t1k = measureMs(() => appendListItems(1_000), 1);
    const t2k = measureMs(() => appendListItems(2_000), 1);
    expect(t2k / Math.max(t1k, 0.1)).toBeLessThan(12);
  });

  it("keeps table growth bounded", () => {
    const t500 = measureMs(() => appendTableRows(500), 1);
    const t1k = measureMs(() => appendTableRows(1_000), 1);
    expect(t1k / Math.max(t500, 0.1)).toBeLessThan(12);
  });
});
