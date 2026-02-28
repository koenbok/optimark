import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

describe("Parser optimistic first-line list transitions", () => {
  it("transitions a plain paragraph into a list when typing '- '", () => {
    const p = new StreamingParser("");
    p.append("-");
    expect(p.getLiveTree()[0]?.type).toBe("paragraph");
    p.append(" ");
    expect(p.getLiveTree()[0]?.type).toBe("list");
    p.append("A");
    expect(p.getLiveTree()[0]?.type).toBe("list");
    
    // Ensure it matches one-shot
    const o = new StreamingParser("- A").getLiveTree();
    expect(p.getLiveTree()).toEqual(o);
  });

  it("transitions a plain paragraph into a list when typing '+ '", () => {
    const p = new StreamingParser("");
    p.append("+");
    p.append(" ");
    expect(p.getLiveTree()[0]?.type).toBe("list");
    
    const o = new StreamingParser("+ ").getLiveTree();
    expect(p.getLiveTree()).toEqual(o);
  });

  it("transitions a plain paragraph into a list when typing '* '", () => {
    const p = new StreamingParser("");
    // * triggers emphasis so it parses as empty or paragraph depending on state
    // But appending ' ' should safely make it a list.
    p.append("*");
    p.append(" ");
    expect(p.getLiveTree()[0]?.type).toBe("list");
    
    const o = new StreamingParser("* ").getLiveTree();
    expect(p.getLiveTree()).toEqual(o);
  });

  it("handles ATX heading on first line", () => {
    const p = new StreamingParser("");
    p.append("#");
    p.append(" ");
    expect(p.getLiveTree()[0]?.type).toBe("heading");
    p.append("A");
    expect(p.getLiveTree()[0]?.type).toBe("heading");
    
    const o = new StreamingParser("# A").getLiveTree();
    expect(p.getLiveTree()).toEqual(o);
  });
});
