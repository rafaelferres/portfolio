import { NextResponse } from "next/server";
import { createBooking } from "@/lib/cal";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { recordEvent } from "@/lib/observability";

export async function POST(req: Request) {
  if (!rateLimit(`book:${clientIp(req)}`, 6, 60 * 60_000)) return NextResponse.json({ ok: false, reason: "limit" }, { status: 429 });
  let d: Record<string, unknown>;
  try {
    d = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (d.website) return NextResponse.json({ ok: true }); // honeypot
  const name = String(d.name ?? "").trim().slice(0, 120);
  const email = String(d.email ?? "").trim().slice(0, 160);
  const company = String(d.company ?? "").trim().slice(0, 120);
  const notes = String(d.notes ?? "").trim().slice(0, 1800);
  const start = String(d.start ?? "");
  const tz = String(d.tz ?? "America/Sao_Paulo").slice(0, 60);
  const locale = String(d.locale ?? "pt").slice(0, 2);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || Number.isNaN(Date.parse(start)) || Date.parse(start) < Date.now()) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }
  try {
    const booking = await createBooking({
      start,
      name,
      email,
      timeZone: tz,
      language: locale,
      notes: [company && `Empresa: ${company}`, notes].filter(Boolean).join("\n\n"),
    });
    await recordEvent("booking_confirmed", { company: company || "—", locale, start: booking.start });
    return NextResponse.json({ ok: true, ...booking });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, reason: "unavailable" }, { status: 409 });
  }
}
