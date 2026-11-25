"use client";

import { track as vercelTrack } from "@vercel/analytics";
import type { FunnelEvent } from "@/lib/funnel-events";

const SID_KEY = "rf-sid";
function sessionId() {
  try {
    let id = sessionStorage.getItem(SID_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SID_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/**
 * Funnel event → Vercel Web Analytics (custom events need the Pro plan; ignored otherwise)
 * and → /api/event (Langfuse, any plan). Max 2 short props.
 */
export function track(name: FunnelEvent, props: Record<string, string | number> = {}, opts: { beacon?: boolean } = {}) {
  try {
    vercelTrack(name, props);
  } catch {}
  if (opts.beacon === false) return; // already recorded server-side
  try {
    const body = JSON.stringify({ name, props, sid: sessionId() });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/event", new Blob([body], { type: "application/json" }));
    else fetch("/api/event", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {}
}
