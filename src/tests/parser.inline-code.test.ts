import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";
import { node } from "./helpers/ast";

describe("Parser.append inline code spans", () => {
  it("parses a closed code span inside text", () => {
    const parser = new StreamingParser("");
    parser.append("a `bc` d");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 8, [
        node("text", 0, 2),
        { type: "code_span", start: 2, end: 6, value: "bc" },
        node("text", 6, 8),
      ]),
    ]);
  });

  it("optimistically auto-closes an unfinished code span", () => {
    const parser = new StreamingParser("");
    parser.append("`hello");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 6, [
        { type: "code_span", start: 0, end: 6, value: "hello" },
      ]),
    ]);
  });

  it("treats markdown syntax inside code spans as raw code", () => {
    const parser = new StreamingParser("");
    parser.append("`**x** [a]`");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 11, [
        { type: "code_span", start: 0, end: 11, value: "**x** [a]" },
      ]),
    ]);
  });

  it("supports multi-backtick delimiters around inline code", () => {
    const parser = new StreamingParser("");
    parser.append("`` `x` ``");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 9, [
        { type: "code_span", start: 0, end: 9, value: " `x` " },
      ]),
    ]);
  });

  it("does not close a code span with a mismatched backtick run", () => {
    const parser = new StreamingParser("");
    parser.append("``code`");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 7, [
        { type: "code_span", start: 0, end: 7, value: "code`" },
      ]),
    ]);
  });

  it("allows shorter and longer backtick runs inside matching delimiters", () => {
    const parser = new StreamingParser("");
    parser.append("```a``b```");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 10, [
        { type: "code_span", start: 0, end: 10, value: "a``b" },
      ]),
    ]);
  });
});

describe("Parser.append escapes", () => {
  it("does not parse escaped emphasis markers", () => {
    const parser = new StreamingParser("");
    parser.append("\\*x\\*");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [node("text", 0, 5)]),
    ]);
  });

  it("does not parse escaped link opener", () => {
    const parser = new StreamingParser("");
    parser.append("\\[a]");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 4, [node("text", 0, 4)]),
    ]);
  });

  it("does not parse escaped backticks as code spans", () => {
    const parser = new StreamingParser("");
    parser.append("\\`x\\`");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [node("text", 0, 5)]),
    ]);
  });
});
