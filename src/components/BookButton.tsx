"use client";

import { useEffect, type ReactNode } from "react";
import { openBooking, preloadBooking } from "@/lib/booking";

/** "Book a call" button: opens the Cal.com scheduler over the page. */
export default function BookButton({ children, className = "btn btn--primary" }: { children: ReactNode; className?: string }) {
  useEffect(() => {
    const id = window.setTimeout(preloadBooking, 4000);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <button type="button" className={className} onClick={() => openBooking()} onMouseEnter={preloadBooking} onFocus={preloadBooking}>
      {children}
    </button>
  );
}
