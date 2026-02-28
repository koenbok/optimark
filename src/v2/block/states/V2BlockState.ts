export type V2BlockStateKind =
  | "paragraph"
  | "heading"
  | "blockquote"
  | "list"
  | "table"
  | "code_block";

export type V2BlockState = {
  kind: V2BlockStateKind;
  start: number;
  end: number;
  lines: string[];
  data?: Record<string, unknown>;
};

export function appendLine(state: V2BlockState, line: string, lineEnd: number): V2BlockState {
  state.lines.push(line);
  state.end = lineEnd;
  return state;
}
