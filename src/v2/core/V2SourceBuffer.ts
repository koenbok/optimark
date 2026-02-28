export class V2SourceBuffer {
  private pending = "";
  private committedOffsetValue = 0;

  append(text: string): void {
    if (!text) return;
    this.pending += text;
  }

  getPendingText(): string {
    return this.pending;
  }

  getCommittedOffset(): number {
    return this.committedOffsetValue;
  }

  consumePrefix(consumed: number): string {
    if (consumed <= 0) return "";
    const prefix = this.pending.slice(0, consumed);
    this.pending = this.pending.slice(consumed);
    this.committedOffsetValue += consumed;
    return prefix;
  }
}
