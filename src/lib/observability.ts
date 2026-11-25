import "server-only";
import { after } from "next/server";

export const langfuseOn = () => !!(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);

/** Flush traces after the response (including streams) finishes, before the serverless function freezes. */
export function flushTracesAfterResponse() {
  if (!langfuseOn()) return;
  after(async () => {
    const p = (globalThis as { __lfProcessor?: { forceFlush: () => Promise<void> } }).__lfProcessor;
    await p?.forceFlush().catch(() => {});
  });
}

/** Wrap an AI SDK call so its trace carries the chat session and tags in Langfuse. */
export async function withTrace<T>(
  attrs: { traceName: string; sessionId?: string; tags?: string[]; metadata?: Record<string, string> },
  fn: () => T,
): Promise<T> {
  if (!langfuseOn()) return fn();
  const { propagateAttributes } = await import("@langfuse/tracing");
  return propagateAttributes(attrs, fn);
}

/** Record a funnel event (e.g. booking_confirmed) as a Langfuse event observation. */
export async function recordEvent(name: string, input: Record<string, string>, sessionId?: string) {
  if (!langfuseOn()) return;
  const { startObservation, propagateAttributes } = await import("@langfuse/tracing");
  propagateAttributes({ traceName: `funnel:${name}`, sessionId, tags: ["funnel", name] }, () => {
    startObservation(name, { input }, { asType: "event" });
  });
  flushTracesAfterResponse();
}
