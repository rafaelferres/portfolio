import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/observability";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { FUNNEL_EVENTS } from "@/lib/funnel-events";

/** Funnel beacon from the browser → Langfuse (works on any Vercel plan). */
export async function POST(req: Request) {
  if (!rateLimit(`ev:${clientIp(req)}`, 120, 10 * 60_000)) return new NextResponse(null, { status: 204 });
  try {
    const d = (await req.json()) as { name?: string; props?: Record<string, unknown>; sid?: string };
    if (!d.name || !(FUNNEL_EVENTS as readonly string[]).includes(d.name)) return new NextResponse(null, { status: 204 });
    const props: Record<string, string> = {};
    for (const [k, v] of Object.entries(d.props ?? {}).slice(0, 6)) props[k.slice(0, 40)] = String(v).slice(0, 120);
    await recordEvent(d.name, props, typeof d.sid === "string" ? d.sid.slice(0, 80) : undefined);
  } catch {}
  return new NextResponse(null, { status: 204 });
}
