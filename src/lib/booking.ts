"use client";

import { getCalApi } from "@calcom/embed-react";
import { site } from "@/lib/site";

type CalFn = (action: string, payload?: unknown) => void;
let ready: Promise<CalFn> | null = null;

/** Lazily loads the Cal.com embed once, themed like the site. */
function cal(): Promise<CalFn> {
  if (!ready) {
    ready = getCalApi({ namespace: "rf" }).then((api) => {
      const c = api as unknown as CalFn;
      c("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        layout: "month_view",
        cssVarsPerTheme: { dark: { "cal-brand": "#ff4757" }, light: { "cal-brand": "#ff4757" } },
      });
      c("on", {
        action: "bookingSuccessfulV2",
        callback: (e: { detail?: { data?: unknown } }) => {
          window.dispatchEvent(new CustomEvent("rf-booked", { detail: e?.detail?.data ?? null }));
        },
      });
      return c;
    });
  }
  return ready;
}

export type BookingPrefill = { name?: string; email?: string; notes?: string };

/** Cal.com booking page in a new tab, used when the embed is blocked (ad blockers, corporate networks). */
function fallback(prefill: BookingPrefill) {
  const q = new URLSearchParams();
  if (prefill.name) q.set("name", prefill.name);
  if (prefill.email) q.set("email", prefill.email);
  if (prefill.notes) q.set("notes", prefill.notes.slice(0, 1500));
  const url = `https://cal.com/${site.calLink}${q.size ? `?${q}` : ""}`;
  const w = window.open(url, "_blank");
  if (w) w.opener = null;
  else window.location.assign(url);
}

/** The embed queues commands even when its script is blocked, so check that the modal really appeared. */
function modalVisible() {
  return !!document.querySelector("cal-modal-box, [data-cal-namespace] iframe, iframe[src*='cal.com']");
}

/** Opens the scheduling modal over the page. */
export async function openBooking(prefill: BookingPrefill = {}) {
  let tries = 0;
  const watch = window.setInterval(() => {
    if (modalVisible()) return window.clearInterval(watch);
    if (++tries >= 20) {
      window.clearInterval(watch);
      fallback(prefill);
    }
  }, 300);
  try {
    const c = await cal();
    const config: Record<string, string> = { theme: "dark", layout: "month_view" };
    if (prefill.name) config.name = prefill.name;
    if (prefill.email) config.email = prefill.email;
    if (prefill.notes) config.notes = prefill.notes.slice(0, 1800);
    c("modal", { calLink: site.calLink, config });
  } catch {
    /* handled by the visibility check above */
  }
}

/** Warm the embed in the background so the first click is instant. */
export function preloadBooking() {
  cal().catch(() => {});
}
