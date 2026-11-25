"use client";

export type BookingPrefill = { name?: string; email?: string; notes?: string };

/** Opens the site's own scheduling dialog (BookingModal, backed by the Cal.com API). */
export function openBooking(prefill: BookingPrefill = {}) {
  window.dispatchEvent(new CustomEvent("rf-book", { detail: prefill }));
}

/** Warm the slots endpoint so the first open feels instant. */
export function preloadBooking() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/booking/slots?tz=${encodeURIComponent(tz)}`).catch(() => {});
  } catch {}
}
