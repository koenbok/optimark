import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";
import { node } from "./helpers/ast";

describe("Parser.append images", () => {
  it("parses a complete inline image", () => {
    const parser = new StreamingParser("");
    parser.append("![alt](https://img)");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 19, [
        {
          type: "image",
          start: 0,
          end: 19,
          url: "https://img",
          title: null,
          alt: "alt",
        },
      ]),
    ]);
  });

  it("optimistically parses incomplete image destination", () => {
    const parser = new StreamingParser("");
    parser.append("![a](http");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 9, [
        {
          type: "image",
          start: 0,
          end: 9,
          url: "http",
          title: null,
          alt: "a",
        },
      ]),
    ]);
  });
});

describe("Parser.append autolinks", () => {
  it("optimistically parses an unclosed URL autolink candidate", () => {
    const parser = new StreamingParser("");
    parser.append("<https://example.com");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 20, [
        {
          type: "autolink",
          start: 0,
          end: 20,
          url: "https://example.com",
        },
      ]),
    ]);
  });

  it("optimistically parses an unclosed html comment candidate", () => {
    const parser = new StreamingParser("");
    parser.append("<!-- hello");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 10, [
        { type: "html_inline", start: 0, end: 10, value: "<!-- hello" },
      ]),
    ]);
  });

  it("parses a complete autolink", () => {
    const parser = new StreamingParser("");
    parser.append("<https://example.com>");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 21, [
        {
          type: "autolink",
          start: 0,
          end: 21,
          url: "https://example.com",
        },
      ]),
    ]);
  });

  it("treats standalone non-URL angle-brackets as inline html by default", () => {
    const parser = new StreamingParser("");
    parser.append("<tag>");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [
        { type: "html_inline", start: 0, end: 5, value: "<tag>" },
      ]),
    ]);
  });

  it("can parse standalone non-URL angle-brackets as HTML blocks when enabled", () => {
    const parser = new StreamingParser("", { htmlBlocks: true });
    parser.append("<tag>");

    expect(parser.getLiveTree()).toEqual([
      { type: "html_block", start: 0, end: 5, value: "<tag>" },
    ]);
  });
});
