import {
  Fragment,
  createElement,
  memo,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { StreamingParser } from "../StreamingParser";
import type { AstNode } from "../types";

type NodeByType<T extends AstNode["type"]> = Extract<AstNode, { type: T }>;

export type MarkdownRendererProps<T extends AstNode = AstNode> = {
  node: T;
  sourceText: string;
  children: ReactNode[];
  keyPath: string;
  renderChildren: () => ReactNode[];
  defaultRender: () => ReactNode;
};

export type MarkdownComponents = {
  [K in AstNode["type"]]?: (
    props: MarkdownRendererProps<NodeByType<K>>,
  ) => ReactNode;
};

export type MarkdownProps = {
  text: string;
  optimistic?: boolean;
  className?: string;
  components?: MarkdownComponents;
};

export function Markdown({
  text,
  optimistic = true,
  className = "markdown",
  components,
}: MarkdownProps): ReactNode {
  const parserRef = useRef<StreamingParser | null>(null);
  const previousTextRef = useRef<string>(text);
  const previousOptimisticRef = useRef<boolean>(optimistic);
  const sourceTextRef = useRef<string>(text);
  const epochRef = useRef<number>(0);
  const [, setRenderVersion] = useState<number>(0);

  if (!parserRef.current) {
    parserRef.current = new StreamingParser(text);
    previousTextRef.current = text;
    sourceTextRef.current = text;
  }

  useEffect(() => {
    const parser = parserRef.current;
    if (!parser) {
      return;
    }

    const previousText = previousTextRef.current;
    const modeChanged = previousOptimisticRef.current !== optimistic;
    if (text === previousText && !modeChanged) {
      return;
    }

    if (optimistic && !modeChanged && text.startsWith(previousText)) {
      parser.append(text.slice(previousText.length));
      previousTextRef.current = text;
      previousOptimisticRef.current = optimistic;
      sourceTextRef.current = text;
      setRenderVersion((version) => version + 1);
      return;
    }

    const resetParser = new StreamingParser(text);
    parserRef.current = resetParser;
    previousTextRef.current = text;
    previousOptimisticRef.current = optimistic;
    sourceTextRef.current = text;
    if (optimistic && !text.startsWith(previousText)) {
      epochRef.current += 1;
    }
    setRenderVersion((version) => version + 1);
  }, [text, optimistic]);

  const parser = parserRef.current;
  const liveTree = parser ? parser.getLiveTree() : [];
  const rootPath = `root:${epochRef.current}`;
  const children = liveTree.map((node, index) => {
    const keyPath = buildKeyPath(rootPath, node, index);
    return createElement(MemoNodeBlock, {
      key: keyPath,
      keyPath,
      node,
      revision: node.end,
      sourceTextRef,
      components,
    });
  });

  return createElement("div", { className }, ...children);
}

function renderNodes(
  nodes: AstNode[],
  sourceText: string,
  path: string,
  components: MarkdownComponents | undefined,
): ReactNode[] {
  return nodes.map((node, index) => {
    const keyPath = buildKeyPath(path, node, index);
    return createElement(
      Fragment,
      { key: keyPath },
      renderNode(node, sourceText, keyPath, components),
    );
  });
}

function renderNode(
  node: AstNode,
  sourceText: string,
  keyPath: string,
  components: MarkdownComponents | undefined,
): ReactNode {
  const context = { sourceText, keyPath, components };

  switch (node.type) {
    case "paragraph": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement("p", null, ...children),
      );
    }

    case "heading": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement(`h${node.depth}`, null, ...children),
      );
    }

    case "blockquote": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement("blockquote", null, ...children),
      );
    }

    case "list": {
      const tag = node.ordered ? "ol" : "ul";
      const children = renderNodes(node.children, sourceText, keyPath, components);
      const start =
        node.ordered && node.startNumber && node.startNumber !== 1
          ? node.startNumber
          : undefined;
      return renderWithCustom(node, context, children, () =>
        createElement(tag, start ? { start } : null, ...children),
      );
    }

    case "list_item": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement("li", null, ...children),
      );
    }

    case "task_item": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement(
          "li",
          null,
          createElement("input", {
            type: "checkbox",
            checked: node.checked,
            disabled: true,
            readOnly: true,
          }),
          " ",
          ...children,
        ),
      );
    }

    case "thematic_break":
      return renderWithCustom(node, context, [], () => createElement("hr"));

    case "code_block":
      return renderWithCustom(node, context, [], () =>
        createElement(
          "pre",
          null,
          createElement(
            "code",
            {
              className: node.language ? `language-${node.language}` : undefined,
            },
            node.value,
          ),
        ),
      );

    case "html_block":
      return renderWithCustom(node, context, [], () =>
        createElement("div", {
          dangerouslySetInnerHTML: { __html: node.value },
        }),
      );

    case "table": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement("table", null, ...children),
      );
    }

    case "table_row": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement("tr", null, ...children),
      );
    }

    case "table_cell": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement(node.header ? "th" : "td", null, ...children),
      );
    }

    case "text":
      return renderWithCustom(node, context, [], () =>
        sourceText.slice(node.start, node.end),
      );

    case "emphasis": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement("em", null, ...children),
      );
    }

    case "strong": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement("strong", null, ...children),
      );
    }

    case "strikethrough": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement("del", null, ...children),
      );
    }

    case "code_span":
      return renderWithCustom(node, context, [], () =>
        createElement("code", null, node.value),
      );

    case "link": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement(
          "a",
          {
            href: node.url ?? undefined,
            title: node.title ?? undefined,
          },
          ...children,
        ),
      );
    }

    case "image":
      return renderWithCustom(node, context, [], () =>
        createElement("img", {
          src: node.url ?? undefined,
          alt: node.alt,
          title: node.title ?? undefined,
        }),
      );

    case "autolink":
      return renderWithCustom(node, context, [], () =>
        createElement("a", { href: node.url }, node.url),
      );

    case "html_inline":
      return renderWithCustom(node, context, [], () =>
        createElement("span", {
          dangerouslySetInnerHTML: { __html: node.value },
        }),
      );

    case "line_break":
      return renderWithCustom(node, context, [], () => createElement("br"));

    case "soft_break":
      return renderWithCustom(node, context, [], () => "\n");

    case "document": {
      const children = renderNodes(node.children, sourceText, keyPath, components);
      return renderWithCustom(node, context, children, () =>
        createElement(Fragment, null, ...children),
      );
    }

    default:
      return null;
  }
}

function renderWithCustom<T extends AstNode>(
  node: T,
  context: {
    sourceText: string;
    keyPath: string;
    components: MarkdownComponents | undefined;
  },
  children: ReactNode[],
  defaultRender: () => ReactNode,
): ReactNode {
  const renderer = context.components?.[node.type] as
    | ((props: MarkdownRendererProps<T>) => ReactNode)
    | undefined;

  if (!renderer) {
    return defaultRender();
  }

  return renderer({
    node,
    sourceText: context.sourceText,
    children,
    keyPath: context.keyPath,
    renderChildren: () => children,
    defaultRender,
  });
}

type NodeBlockProps = {
  keyPath: string;
  node: AstNode;
  revision: number;
  sourceTextRef: MutableRefObject<string>;
  components: MarkdownComponents | undefined;
};

function NodeBlock({
  keyPath,
  node,
  sourceTextRef,
  components,
}: NodeBlockProps): ReactNode {
  return renderNode(node, sourceTextRef.current, keyPath, components);
}

const MemoNodeBlock = memo(
  NodeBlock,
  (previous, next) =>
    previous.node === next.node &&
    previous.revision === next.revision &&
    previous.components === next.components &&
    previous.keyPath === next.keyPath &&
    previous.sourceTextRef === next.sourceTextRef,
);

function buildKeyPath(path: string, node: AstNode, index: number): string {
  return `${path}:${node.type}:${node.start}:${index}`;
}
