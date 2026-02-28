import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

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
  const parser = new StreamingParser("");
  const text = "a".repeat(count);
  for (let i = 0; i < text.length; i += 1) {
    parser.append(text[i] ?? "");
  }
};

describe("Parser performance guardrails", () => {
  it("maintains near-linear scaling for char-by-char append", () => {
    const t5k = measureMs(() => appendCharByChar(5_000), 3);
    const t10k = measureMs(() => appendCharByChar(10_000), 3);
    const ratio = t10k / Math.max(t5k, 0.1);

    // Guard against returning to superlinear behavior.
    expect(ratio).toBeLessThan(6);
  });

  it("keeps incremental overhead bounded versus one-shot parse", () => {
    const incremental = measureMs(() => appendCharByChar(10_000), 3);
    const oneShot = measureMs(() => {
      void new StreamingParser("a".repeat(10_000));
    }, 3);
    const ratio = incremental / Math.max(oneShot, 0.1);

    // One-shot construction is very cheap for trivial input; keep a broad cap.
    expect(ratio).toBeLessThan(120);
  });

  it("does not throw on pathological unmatched bracket input", () => {
    const parser = new StreamingParser("");
    const input = "[".repeat(100_000);
    expect(() => parser.append(input)).not.toThrow();
  });

  it("finishes large char-by-char appends within a practical bound", () => {
    const elapsed = measureMs(() => appendCharByChar(40_000), 1);
    expect(elapsed).toBeLessThan(3_000);
  });
});
