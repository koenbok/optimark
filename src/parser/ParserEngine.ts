import type { AstNode } from "../types";
import { BlockReducer } from "./BlockReducer";
import { InlineReducer } from "./InlineReducer";
import { LineScanner } from "./LineScanner";
import { LiveTreeAssembler } from "./LiveTreeAssembler";
import { StreamState } from "./StreamState";

export class ParserEngine {
  private readonly state = new StreamState();
  private readonly inline = new InlineReducer();
  private readonly blocks = new BlockReducer(this.inline);
  private readonly scanner = new LineScanner();
  private readonly assembler = new LiveTreeAssembler();

  constructor(initialText: string) {
    if (initialText.length > 0) {
      this.append(initialText);
    }
  }

  append(text: string): void {
    if (!text) return;

    if (this.tryFastPlainTextAppend(text)) {
      return;
    }

    this.state.pendingText += text;
    this.consumeCommittedBlocks();
    this.rebuildLiveTree();
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

      const blockText = this.state.pendingText.slice(0, boundary);
      if (blockText.length > 0) {
        const committedNodes = this.blocks.parseBlocks(
          blockText,
          this.state.committedOffset,
        );
        this.state.committedBlocks.push(...committedNodes);
      }

      this.state.pendingText = this.state.pendingText.slice(boundary + 2);
      this.state.committedOffset += boundary + 2;
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

    this.state.liveTree = this.assembler.replaceActiveTail(
      this.state.liveTree,
      this.state.committedBlocks,
      activeNodes,
    );
  }

  private tryFastPlainTextAppend(text: string): boolean {
    if (!this.isFastPathChunk(text)) {
      return false;
    }

    const pending = this.state.pendingText;
    if (pending.length === 0) {
      return false;
    }
    if (this.inline.getPendingSuffixLength(pending) !== 0) {
      return false;
    }
    if (pending.includes("\n")) {
      return false;
    }

    const liveTail = this.state.liveTree.at(-1);

    if (!liveTail || liveTail.type !== "paragraph") {
      return false;
    }
    if (liveTail.children.length !== 1 || liveTail.children[0]?.type !== "text") {
      return false;
    }
    if (liveTail.start !== this.state.committedOffset) {
      return false;
    }
    if (liveTail.end !== this.state.committedOffset + pending.length) {
      return false;
    }

    this.state.pendingText += text;
    const textNode = liveTail.children[0];
    textNode.end += text.length;
    liveTail.end += text.length;
    return true;
  }

  private isFastPathChunk(text: string): boolean {
    return !/[\\`\n\[\]!<*_\#]/.test(text);
  }
}
