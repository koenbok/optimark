import type { AstNode } from "../types";
import { BlockReducer } from "./BlockReducer";
import { BlockStateMachine } from "./BlockStateMachine";
import { InlineReducer } from "./InlineReducer";
import { LineScanner } from "./LineScanner";
import { replaceActiveTail } from "./LiveTreeAssembler";
import { StreamState } from "./StreamState";

export class ParserEngine {
  private readonly state = new StreamState();
  private readonly inline = new InlineReducer();
  private readonly blocks = new BlockReducer(this.inline);
  private readonly scanner = new LineScanner();
  private readonly machine = new BlockStateMachine();

  constructor(initialText: string) {
    if (initialText.length > 0) {
      this.append(initialText);
    }
  }

  append(text: string): void {
    if (!text) return;

    const incremental = this.machine.tryAppendDelta(text, {
      state: this.state,
      inline: this.inline,
    });
    if (incremental.handled) {
      return;
    }

    this.state.appendPending(text);
    this.consumeCommittedBlocks();
    this.rebuildLiveTree();
    this.machine.reset();
  }

  getLiveTree(): AstNode[] {
    return this.state.liveTree;
  }

  getPendingText(): string {
    return this.state.pendingText;
  }

  private consumeCommittedBlocks(): void {
    while (true) {
      const boundary = this.scanner.findNextCommitBoundary(this.state.pendingText);
      if (boundary < 0) {
        return;
      }

      const blockOffset = this.state.committedOffset;
      const { text: blockText } = this.state.commitBoundary(boundary);
      if (blockText.length > 0) {
        const committedNodes = this.blocks.parseBlocks(blockText, blockOffset);
        this.state.committedBlocks.push(...committedNodes);
      }
    }
  }

  private rebuildLiveTree(): void {
    const pendingSuffixLength = this.inline.getPendingSuffixLength(
      this.state.pendingText,
    );
    const parsable = this.state.pendingText.slice(
      0,
      this.state.pendingText.length - pendingSuffixLength,
    );
    const activeNodes = parsable.length
      ? this.blocks.parseBlocks(parsable, this.state.committedOffset)
      : [];

    this.state.liveTree = replaceActiveTail(
      this.state.liveTree,
      this.state.committedBlocks,
      activeNodes,
    );
  }
}
