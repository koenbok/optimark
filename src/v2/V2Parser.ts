import type { AstNode } from "../types";
import { V2AstAdapter } from "./ast/V2AstAdapter";
import { V2AstBuilder } from "./ast/V2AstBuilder";
import { V2BlockMachine } from "./block/V2BlockMachine";
import { V2InlineMachine } from "./inline/V2InlineMachine";
import { V2State } from "./core/V2State";

export class V2Parser {
  private readonly state = new V2State();
  private readonly blockMachine = new V2BlockMachine();
  private readonly inlineMachine = new V2InlineMachine();
  private readonly astBuilder = new V2AstBuilder();
  private readonly astAdapter = new V2AstAdapter();

  constructor(initialText = "") {
    if (initialText.length > 0) {
      this.append(initialText);
    }
  }

  append(text: string): void {
    if (!text) return;
    this.state.sourceBuffer.append(text);
    this.recompute();
  }

  getLiveTree(): AstNode[] {
    return this.state.liveTree;
  }

  getPendingText(): string {
    return this.state.sourceBuffer.getPendingText();
  }

  private recompute(): void {
    const pendingText = this.state.sourceBuffer.getPendingText();
    const committedOffset = this.state.sourceBuffer.getCommittedOffset();
    const parseResult = this.blockMachine.parsePending(
      pendingText,
      committedOffset,
      () => this.state.nextBlockId(),
    );

    if (parseResult.consumedChars > 0) {
      this.state.committedBlocks = this.state.committedBlocks.concat(
        parseResult.committedBlocks,
      );
      this.state.sourceBuffer.consumePrefix(parseResult.consumedChars);
    }

    this.state.activeBlocks = parseResult.activeBlocks;
    const allBlocks = this.state.committedBlocks.concat(this.state.activeBlocks);
    const inlineResult = this.inlineMachine.parseDirtyBlocks(allBlocks);
    const internalNodes = this.astBuilder.build(allBlocks, inlineResult);
    this.state.liveTree = this.astAdapter.toAst(internalNodes);
  }
}
