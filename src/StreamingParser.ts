import type { AstNode } from "./types";
import { ParserEngine, type ParserEngineOptions } from "./parser/ParserEngine";

export type StreamingParserOptions = ParserEngineOptions;

export class StreamingParser {
  private readonly engine: ParserEngine;

  constructor(initialText: string, options: StreamingParserOptions = {}) {
    this.engine = new ParserEngine(initialText, options);
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
