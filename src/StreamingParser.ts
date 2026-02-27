import type { AstNode } from "./types";
import { ParserEngine } from "./parser/ParserEngine";

export class StreamingParser {
  private readonly engine: ParserEngine;

  constructor(initialText: string) {
    this.engine = new ParserEngine(initialText);
  }

  append(text: string): void {
    this.engine.append(text);
  }

  getLiveTree(): AstNode[] {
    return this.engine.getLiveTree();
  }

  getPendingText(): string {
    return this.engine.getPendingText();
  }
}
