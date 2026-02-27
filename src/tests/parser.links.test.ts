import { describe, expect, it } from "bun:test";
import { Parser } from "../Parser";
import { node } from "./helpers/ast";

describe("Parser.append optimistic links", () => {
  it("auto-closes an unfinished link label and emits a link", () => {
    const parser = new Parser("");
    parser.append("[hel");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 4, [node("link", 0, 4, [node("text", 1, 4)])]),
    ]);
  });

  it("promotes a closed label to a link even without destination", () => {
    const parser = new Parser("");
    parser.append("[hello]");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 7, [node("link", 0, 7, [node("text", 1, 6)])]),
    ]);
  });

  it("parses an unfinished link destination optimistically after ](", () => {
    const parser = new Parser("");
    parser.append("[hello](");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 8, [node("link", 0, 8, [node("text", 1, 6)])]),
    ]);
  });

  it("keeps growing an unfinished destination as link node", () => {
    const parser = new Parser("");
    parser.append("[hello](ht");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 10, [node("link", 0, 10, [node("text", 1, 6)])]),
    ]);
  });

  it("parses a finished inline link as link node", () => {
    const parser = new Parser("");
    parser.append("[hello](x)");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 10, [node("link", 0, 10, [node("text", 1, 6)])]),
    ]);
  });

  it("supports incremental growth from open label to full destination", () => {
    const parser = new Parser("");
    parser.append("[hel");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 4, [node("link", 0, 4, [node("text", 1, 4)])]),
    ]);

    parser.append("lo]");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 7, [node("link", 0, 7, [node("text", 1, 6)])]),
    ]);

    parser.append("(x)");
    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 10, [node("link", 0, 10, [node("text", 1, 6)])]),
    ]);
  });

  it("parses links that follow plain text in the same block", () => {
    const parser = new Parser("");
    parser.append("x[hel");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 5, [
        node("text", 0, 1),
        node("link", 1, 5, [node("text", 2, 5)]),
      ]),
    ]);
  });

  it("parses link labels with nested inline formatting", () => {
    const parser = new Parser("");
    parser.append("[**hi**]");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 8, [
        {
          type: "link",
          start: 0,
          end: 8,
          url: null,
          title: null,
          children: [node("strong", 1, 7, [node("text", 3, 5)])],
        },
      ]),
    ]);
  });

  it("supports multiple optimistic links in one paragraph", () => {
    const parser = new Parser("");
    parser.append("[a] [b](x)");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 10, [
        node("link", 0, 3, [node("text", 1, 2)]),
        node("text", 3, 4),
        node("link", 4, 10, [node("text", 5, 6)]),
      ]),
    ]);
  });

  it("keeps parsing text after an optimistic link", () => {
    const parser = new Parser("");
    parser.append("[a] tail");

    expect(parser.getLiveTree()).toEqual([
      node("paragraph", 0, 8, [
        node("link", 0, 3, [node("text", 1, 2)]),
        node("text", 3, 8),
      ]),
    ]);
  });
});
