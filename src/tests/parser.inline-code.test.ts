import { describe, expect, it } from "bun:test";
import { Parser } from "../Parser";
import { node } from "./helpers/ast";

describe("Parser.append inline code spans", () => {
  it("parses a closed code span inside text", () => {
    const parser = new Parser("");
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
    const parser = new Parser("");
    parser.append("`hello");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 6, [
        { type: "code_span", start: 0, end: 6, value: "hello" },
      ]),
    ]);
  });

  it("treats markdown syntax inside code spans as raw code", () => {
    const parser = new Parser("");
    parser.append("`**x** [a]`");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 11, [
        { type: "code_span", start: 0, end: 11, value: "**x** [a]" },
      ]),
    ]);
  });
});

describe("Parser.append escapes", () => {
  it("does not parse escaped emphasis markers", () => {
    const parser = new Parser("");
    parser.append("\\*x\\*");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [node("text", 0, 5)]),
    ]);
  });

  it("does not parse escaped link opener", () => {
    const parser = new Parser("");
    parser.append("\\[a]");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 4, [node("text", 0, 4)]),
    ]);
  });

  it("does not parse escaped backticks as code spans", () => {
    const parser = new Parser("");
    parser.append("\\`x\\`");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [node("text", 0, 5)]),
    ]);
  });
});
