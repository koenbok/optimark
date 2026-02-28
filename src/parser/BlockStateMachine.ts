import type { AstNode } from "../types";
import { createActiveBlockState, type ActiveBlockState } from "./ActiveBlockState";
import type { InlineReducer } from "./InlineReducer";
import type { StreamState } from "./StreamState";
import type { ActiveAppendResult } from "./types";

export type BlockStateMachineContext = {
  state: Pick<
    StreamState,
    "pendingText" | "committedOffset" | "liveTree" | "committedBlocks" | "appendPending"
  >;
  inline: InlineReducer;
};

export class BlockStateMachine {
  private activeNode: AstNode | null = null;
  private activeState: ActiveBlockState | null = null;

  tryAppendDelta(chunk: string, context: BlockStateMachineContext): ActiveAppendResult {
    const { state } = context;
    if (!chunk) {
      return { handled: false, code: "empty-append" };
    }
    if (!state.pendingText.length) {
      return { handled: false, code: "no-active-tail" };
    }
    if (wouldIntroduceCommitBoundary(state.pendingText, chunk)) {
      return { handled: false, code: "commit-boundary-introduced" };
    }
    if (state.liveTree.length !== state.committedBlocks.length + 1) {
      return { handled: false, code: "active-tail-not-singular" };
    }

    const liveTail = state.liveTree.at(-1);
    if (!liveTail || liveTail.start !== state.committedOffset) {
      return { handled: false, code: "active-tail-offset-mismatch" };
    }

    this.syncActiveState(liveTail, state.pendingText);
    if (!this.activeState) {
      return { handled: false, code: "no-state-handler" };
    }

    const result = this.activeState.append(chunk, {
      pendingText: state.pendingText,
      committedOffset: state.committedOffset,
      inline: context.inline,
      appendToPending: (delta) => state.appendPending(delta),
    });

    if (result.handled) {
      return result;
    }

    this.activeNode = null;
    this.activeState = null;
    return { handled: false, code: result.code ?? "state-rejected" };
  }

  reset(): void {
    this.activeNode = null;
    this.activeState = null;
  }

  private syncActiveState(liveTail: AstNode, pendingText: string): void {
    if (this.activeNode === liveTail && this.activeState?.node === liveTail) {
      return;
    }
    this.activeNode = liveTail;
    this.activeState = createActiveBlockState(liveTail, pendingText);
  }
}

function wouldIntroduceCommitBoundary(pendingText: string, text: string): boolean {
  if (text.includes("\n\n")) {
    return true;
  }
  return pendingText.endsWith("\n") && text.startsWith("\n");
}
