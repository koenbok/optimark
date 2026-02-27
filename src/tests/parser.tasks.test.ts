import { describe, expect, it } from "bun:test";
import { StreamingParser } from "../StreamingParser";

describe("Parser.append optimistic todo items", () => {
  it("promotes '- [ ] task' into a task item", () => {
    const parser = new StreamingParser("");
    parser.append("- [ ] task");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 10,
        ordered: false,
        tight: false,
        children: [
          {
            type: "task_item",
            checked: false,
            start: 0,
            end: 10,
            children: [
              {
                type: "paragraph",
                start: 6,
                end: 10,
                children: [{ type: "text", start: 6, end: 10 }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("supports nested checked todo items", () => {
    const parser = new StreamingParser("");
    parser.append("- [ ] parent\n  - [x] child");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 26,
        ordered: false,
        tight: false,
        children: [
          {
            type: "task_item",
            checked: false,
            start: 0,
            end: 26,
            children: [
              {
                type: "paragraph",
                start: 6,
                end: 12,
                children: [{ type: "text", start: 6, end: 12 }],
              },
              {
                type: "list",
                start: 13,
                end: 26,
                ordered: false,
                tight: false,
                children: [
                  {
                    type: "task_item",
                    checked: true,
                    start: 13,
                    end: 26,
                    children: [
                      {
                        type: "paragraph",
                        start: 21,
                        end: 26,
                        children: [{ type: "text", start: 21, end: 26 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("treats uppercase X as checked", () => {
    const parser = new StreamingParser("");
    parser.append("- [X] done");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 10,
        ordered: false,
        tight: false,
        children: [
          {
            type: "task_item",
            checked: true,
            start: 0,
            end: 10,
            children: [
              {
                type: "paragraph",
                start: 6,
                end: 10,
                children: [{ type: "text", start: 6, end: 10 }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("supports sibling task items with mixed checked states", () => {
    const parser = new StreamingParser("");
    parser.append("- [ ] a\n- [x] b");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 15,
        ordered: false,
        tight: false,
        children: [
          {
            type: "task_item",
            checked: false,
            start: 0,
            end: 7,
            children: [
              {
                type: "paragraph",
                start: 6,
                end: 7,
                children: [{ type: "text", start: 6, end: 7 }],
              },
            ],
          },
          {
            type: "task_item",
            checked: true,
            start: 8,
            end: 15,
            children: [
              {
                type: "paragraph",
                start: 14,
                end: 15,
                children: [{ type: "text", start: 14, end: 15 }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("keeps links inside task text as inline children", () => {
    const parser = new StreamingParser("");
    parser.append("- [ ] [a]");

    expect(parser.getLiveTree()).toEqual([
      {
        type: "list",
        start: 0,
        end: 9,
        ordered: false,
        tight: false,
        children: [
          {
            type: "task_item",
            checked: false,
            start: 0,
            end: 9,
            children: [
              {
                type: "paragraph",
                start: 6,
                end: 9,
                children: [
                  {
                    type: "link",
                    start: 6,
                    end: 9,
                    url: null,
                    title: null,
                    children: [{ type: "text", start: 7, end: 8 }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});
