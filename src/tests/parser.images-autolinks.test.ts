import { describe, expect, it } from "bun:test";
import { Parser } from "../Parser";
import { node } from "./helpers/ast";

describe("Parser.append images", () => {
  it("parses a complete inline image", () => {
    const parser = new Parser("");
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
    const parser = new Parser("");
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
    const parser = new Parser("");
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
    const parser = new Parser("");
    parser.append("<tag>");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [node("text", 0, 5)]),
    ]);
  });
});
