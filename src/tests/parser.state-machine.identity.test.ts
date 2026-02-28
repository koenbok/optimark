import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

describe("Parser state machine identity", () => {
  it("reuses paragraph node for plain-text delta appends", () => {
    const parser = new StreamingParser("");
    parser.append("hello");
    const first = parser.getLiveTree()[0];
    expect(first?.type).toBe("paragraph");

    parser.append(" world");
    const second = parser.getLiveTree()[0];
    expect(second).toBe(first);
  });

  it("reuses heading node for plain-text suffix appends", () => {
    const parser = new StreamingParser("");
    parser.append("# Hel");
    const first = parser.getLiveTree()[0];
    expect(first?.type).toBe("heading");

    parser.append("lo");
    const second = parser.getLiveTree()[0];
    expect(second).toBe(first);
  });

  it("reuses simple blockquote node for inline tail growth", () => {
    const parser = new StreamingParser("");
    parser.append("> note");
    const first = parser.getLiveTree()[0];
    expect(first?.type).toBe("blockquote");

    parser.append("s");
    const second = parser.getLiveTree()[0];
    expect(second).toBe(first);
  });
});
