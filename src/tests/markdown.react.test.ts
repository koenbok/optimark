import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { createElement, useEffect, useRef, type ReactNode } from "react";
import { cleanup, render } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { Markdown, type MarkdownComponents } from "../react/Markdown";
import type { AstNode } from "../types";

beforeAll(() => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
  });
  const globalObject = globalThis as Record<string, unknown>;
  globalObject.window = dom.window;
  globalObject.document = dom.window.document;
  globalObject.navigator = dom.window.navigator;
  globalObject.HTMLElement = dom.window.HTMLElement;
  globalObject.Node = dom.window.Node;
  globalObject.MutationObserver = dom.window.MutationObserver;
  globalObject.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
});

afterEach(() => {
  cleanup();
});

describe("React Markdown component", () => {
  it("defaults root className to markdown and allows overrides", () => {
    const view = render(createElement(Markdown, { text: "hello" }));
    let rootDiv = view.container.firstElementChild as HTMLDivElement | null;
    expect(rootDiv?.className).toBe("markdown");

    view.rerender(createElement(Markdown, { text: "hello", className: "prose" }));

    rootDiv = view.container.firstElementChild as HTMLDivElement | null;
    expect(rootDiv?.className).toBe("prose");
  });

  it("keeps keyed paragraph instances mounted across append updates", () => {
    let paragraphMounts = 0;

    const ParagraphProbe = ({ children }: { children: ReactNode[] }): ReactNode => {
      const idRef = useRef(Symbol("paragraph"));
      void idRef.current;
      useEffect(() => {
        paragraphMounts += 1;
      }, []);
      return createElement("p", null, ...children);
    };

    const components: MarkdownComponents = {
      paragraph: ({ children }) => createElement(ParagraphProbe, { children }),
    };

    const view = render(createElement(Markdown, { text: "hello", components }));
    view.rerender(createElement(Markdown, { text: "hello!", components }));

    expect(paragraphMounts).toBe(1);
  });

  it("avoids rerendering committed blocks while tail block updates", () => {
    const renderCounts = new Map<number, number>();
    const components: MarkdownComponents = {
      paragraph: ({ node, defaultRender }) => {
        renderCounts.set(node.start, (renderCounts.get(node.start) ?? 0) + 1);
        return defaultRender();
      },
    };

    const view = render(createElement(Markdown, {
      text: "first\n\ns",
      components,
    }));
    view.rerender(createElement(Markdown, { text: "first\n\nse", components }));
    view.rerender(createElement(Markdown, { text: "first\n\nsec", components }));

    expect(renderCounts.get(0)).toBe(1);
    expect((renderCounts.get(7) ?? 0) >= 2).toBe(true);
  });

  it("keeps committed blocks stable when active tail exits incremental state", () => {
    const mounts = new Map<number, number>();
    const components: MarkdownComponents = {
      paragraph: ({ node, defaultRender }) => {
        useEffect(() => {
          mounts.set(node.start, (mounts.get(node.start) ?? 0) + 1);
        }, [node.start]);
        return defaultRender();
      },
    };

    const view = render(createElement(Markdown, {
      text: "intro\n\n```ts\na",
      components,
    }));
    view.rerender(
      createElement(Markdown, {
        text: "intro\n\n```ts\na\n```",
        components,
      }),
    );

    expect(mounts.get(0)).toBe(1);
  });

  it("updates rendered output when fast-path appends mutate active tail", () => {
    const view = render(createElement(Markdown, { text: "a" }));
    view.rerender(createElement(Markdown, { text: "ab" }));
    expect(view.container.textContent).toContain("ab");
  });

  it("reuses committed AST node objects across incremental updates", () => {
    const seenByStart = new Map<number, AstNode[]>();
    const makeComponents = (): MarkdownComponents => ({
      paragraph: ({ node, defaultRender }) => {
        const seen = seenByStart.get(node.start) ?? [];
        seen.push(node);
        seenByStart.set(node.start, seen);
        return defaultRender();
      },
    });

    const view = render(createElement(Markdown, {
      text: "alpha\n\nb",
      components: makeComponents(),
    }));
    view.rerender(createElement(Markdown, {
      text: "alpha\n\nbe",
      components: makeComponents(),
    }));
    view.rerender(createElement(Markdown, {
      text: "alpha\n\nbet",
      components: makeComponents(),
    }));

    const committedRefs = seenByStart.get(0) ?? [];
    expect(committedRefs.length >= 2).toBe(true);
    for (let i = 1; i < committedRefs.length; i += 1) {
      expect(committedRefs[i]).toBe(committedRefs[0]);
    }
  });

  it("defaults optimistic=true and reuses active-tail node objects when append is eligible", () => {
    const refs: AstNode[] = [];
    const components: MarkdownComponents = {
      paragraph: ({ node, defaultRender }) => {
        refs.push(node);
        return defaultRender();
      },
    };

    const view = render(createElement(Markdown, { text: "hello", components }));
    view.rerender(createElement(Markdown, { text: "hellox", components }));

    expect(refs.length >= 2).toBe(true);
    expect(refs[0]).toBe(refs[1]);
  });

  it("when optimistic=false reparses and does not reuse active-tail node objects", () => {
    const refs: AstNode[] = [];
    const components: MarkdownComponents = {
      paragraph: ({ node, defaultRender }) => {
        refs.push(node);
        return defaultRender();
      },
    };

    const view = render(
      createElement(Markdown, {
        text: "hello",
        optimistic: false,
        components,
      }),
    );
    view.rerender(
      createElement(Markdown, {
        text: "hellox",
        optimistic: false,
        components,
      }),
    );

    expect(refs.length >= 2).toBe(true);
    expect(refs[0]).not.toBe(refs[1]);
  });

  it("keeps list-item element instances stable across complex list growth", () => {
    const itemMounts = new Map<number, number>();

    const ListItemProbe = ({
      start,
      children,
    }: {
      start: number;
      children: ReactNode[];
    }): ReactNode => {
      useEffect(() => {
        itemMounts.set(start, (itemMounts.get(start) ?? 0) + 1);
      }, [start]);
      return createElement("li", null, ...children);
    };

    const components: MarkdownComponents = {
      list_item: ({ node, children }) =>
        createElement(ListItemProbe, { start: node.start, children }),
    };

    const view = render(createElement(Markdown, {
      text: "- one\n- two",
      components,
    }));
    view.rerender(createElement(Markdown, { text: "- one\n- two!", components }));
    view.rerender(
      createElement(Markdown, { text: "- one\n- two!\n- three", components }),
    );

    expect(itemMounts.get(0)).toBe(1);
    expect(itemMounts.get(6)).toBe(1);
    expect(itemMounts.get(13)).toBe(1);
  });

  it("keeps nested blockquote/list elements stable while tail content streams", () => {
    const blockquoteMounts = new Map<number, number>();
    const listMounts = new Map<number, number>();

    const BlockquoteProbe = ({
      start,
      children,
    }: {
      start: number;
      children: ReactNode[];
    }): ReactNode => {
      useEffect(() => {
        blockquoteMounts.set(start, (blockquoteMounts.get(start) ?? 0) + 1);
      }, [start]);
      return createElement("blockquote", null, ...children);
    };

    const ListProbe = ({
      start,
      ordered,
      children,
    }: {
      start: number;
      ordered: boolean;
      children: ReactNode[];
    }): ReactNode => {
      useEffect(() => {
        listMounts.set(start, (listMounts.get(start) ?? 0) + 1);
      }, [start]);
      return createElement(ordered ? "ol" : "ul", null, ...children);
    };

    const components: MarkdownComponents = {
      blockquote: ({ node, children }) =>
        createElement(BlockquoteProbe, { start: node.start, children }),
      list: ({ node, children }) =>
        createElement(ListProbe, {
          start: node.start,
          ordered: node.ordered,
          children,
        }),
    };

    const view = render(createElement(Markdown, {
      text: "> - item",
      components,
    }));
    view.rerender(createElement(Markdown, { text: "> - item x", components }));
    view.rerender(createElement(Markdown, { text: "> - item xy", components }));

    expect(blockquoteMounts.get(0)).toBe(1);
    expect(listMounts.get(2)).toBe(1);
  });
});
