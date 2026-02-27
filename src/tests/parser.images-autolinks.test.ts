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

  it("keeps non-URL angle-brackets as text", () => {
    const parser = new StreamingParser("");
    parser.append("<tag>");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [node("text", 0, 5)]),
    ]);
  });
});
