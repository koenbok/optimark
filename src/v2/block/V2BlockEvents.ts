import type { V2Block, V2BlockEvent } from "../core/V2Types";

export function openEvent(block: V2Block): V2BlockEvent {
  return { type: "open", block };
}

export function appendEvent(block: V2Block): V2BlockEvent {
  return { type: "append", block };
}

export function closeEvent(block: V2Block): V2BlockEvent {
  return { type: "close", block };
}
