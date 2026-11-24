import { NextResponse } from "next/server";

/**
 * Sends contact-form messages by email through Resend (https://resend.com).
 * Configure on Vercel:
 *   RESEND_API_KEY  – your Resend API key
 *   CONTACT_TO      – where messages go (default rafael@ferres.tech)
 *   CONTACT_FROM    – a sender on a domain verified in Resend, e.g. "Site <site@ferres.tech>"
 * Without RESEND_API_KEY this returns 503 and the form falls back to the visitor's mail app.
 */
export async function POST(req: Request) {
  let data: Record<string, string>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (data.website) return NextResponse.json({ ok: true }); // honeypot

  const name = String(data.name ?? "").slice(0, 200).trim();
  const email = String(data.email ?? "").slice(0, 200).trim();
  const company = String(data.company ?? "").slice(0, 200).trim();
  const message = String(data.message ?? "").slice(0, 5000).trim();
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Site Rafael Ferrés <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO ?? "rafael@ferres.tech"],
      reply_to: email,
      subject: `Contato pelo site: ${name}${company ? ` (${company})` : ""}`,
      text: `Nome: ${name}\nE-mail: ${email}\nEmpresa: ${company || "—"}\n\n${message}`,
    }),
  });
  if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 });
  return NextResponse.json({ ok: true });
}
