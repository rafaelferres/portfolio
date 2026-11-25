import { NextResponse } from "next/server";
import { getSlots } from "@/lib/cal";

const validTz = (tz: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export async function GET(req: Request) {
  const u = new URL(req.url);
  const tz = u.searchParams.get("tz") ?? "America/Sao_Paulo";
  try {
    const days = await getSlots(validTz(tz) ? tz : "America/Sao_Paulo");
    return NextResponse.json({ ok: true, days }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, days: [] }, { status: 502 });
  }
}
