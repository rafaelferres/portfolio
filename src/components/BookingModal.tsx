"use client";

import { useEffect, useState } from "react";
import BookingWidget from "@/components/BookingWidget";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { BookingPrefill } from "@/lib/booking";

/** Site-styled scheduling dialog, opened with openBooking(). */
export default function BookingModal({ t, locale }: { t: Dictionary["booking"]; locale: string }) {
  const [open, setOpen] = useState<BookingPrefill | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen((e as CustomEvent<BookingPrefill>).detail ?? {});
      setKey((k) => k + 1);
    };
    window.addEventListener("rf-book", onOpen);
    return () => window.removeEventListener("rf-book", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("bk-lock");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("bk-lock");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="bkm" role="dialog" aria-modal="true" aria-label={t.title} onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}>
      <div className="bkm__card">
        <button type="button" className="agent__icon bkm__close" onClick={() => setOpen(null)} aria-label={t.close}>
          ✕
        </button>
        <BookingWidget
          key={key}
          t={t}
          locale={locale}
          notes={open.notes}
          name={open.name}
          email={open.email}
          onBooked={(b) => window.dispatchEvent(new CustomEvent("rf-booked", { detail: b }))}
        />
      </div>
    </div>
  );
}
