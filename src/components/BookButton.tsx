"use client";

import type { ReactNode } from "react";
import { openBooking, preloadBooking } from "@/lib/booking";

/** "Book a call" button: opens the site's scheduling dialog. */
export default function BookButton({ children, className = "btn btn--primary" }: { children: ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => openBooking()} onMouseEnter={preloadBooking} onFocus={preloadBooking}>
      {children}
    </button>
  );
}
