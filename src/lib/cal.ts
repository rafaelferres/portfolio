import "server-only";
import { site } from "@/lib/site";

/** Cal.com API v2 (public endpoints; CAL_API_KEY is optional). */
const [USERNAME, EVENT_SLUG] = site.calLink.split("/");
const API = "https://api.cal.com/v2";

function headers(version: string): HeadersInit {
  const h: Record<string, string> = { "cal-api-version": version, Accept: "application/json" };
  if (process.env.CAL_API_KEY) h.Authorization = `Bearer ${process.env.CAL_API_KEY}`;
  return h;
}

export type DaySlots = { date: string; slots: string[] };

/** Free slots as ISO start times, grouped by day in the visitor's timezone. */
export async function getSlots(tz: string, days = 14): Promise<DaySlots[]> {
  if (process.env.AGENT_MOCK === "1") return mockSlots();
  const start = new Date();
  const end = new Date(start.getTime() + days * 86_400_000);
  const q = new URLSearchParams({
    eventTypeSlug: EVENT_SLUG,
    username: USERNAME,
    start: start.toISOString(),
    end: end.toISOString(),
    timeZone: tz,
  });
  const res = await fetch(`${API}/slots?${q}`, { headers: headers("2024-09-04"), next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`cal slots ${res.status}`);
  const json = (await res.json()) as { data?: Record<string, unknown> };
  const data = (json.data && "slots" in json.data ? (json.data as { slots: Record<string, unknown> }).slots : json.data) ?? {};
  return Object.entries(data as Record<string, unknown[]>)
    .map(([date, list]) => ({
      date,
      slots: (Array.isArray(list) ? list : [])
        .map((s) => (typeof s === "string" ? s : ((s as { start?: string; time?: string }).start ?? (s as { time?: string }).time ?? "")))
        .filter(Boolean),
    }))
    .filter((d) => d.slots.length)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export type BookingInput = { start: string; name: string; email: string; timeZone: string; language: string; notes: string };

export async function createBooking(b: BookingInput) {
  if (process.env.AGENT_MOCK === "1") return { uid: "mock", start: b.start, meetingUrl: "" };
  const res = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: { ...headers("2024-08-13"), "Content-Type": "application/json" },
    body: JSON.stringify({
      eventTypeSlug: EVENT_SLUG,
      username: USERNAME,
      start: new Date(b.start).toISOString(),
      attendee: { name: b.name, email: b.email, timeZone: b.timeZone, language: b.language },
      bookingFieldsResponses: b.notes ? { notes: b.notes } : undefined,
      metadata: { source: "ferres.tech" },
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { data?: Record<string, unknown>; error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? `cal booking ${res.status}`);
  const d = json.data ?? {};
  return {
    uid: String(d.uid ?? ""),
    start: String(d.start ?? b.start),
    meetingUrl: String(d.meetingUrl ?? d.location ?? ""),
  };
}

/** Local-only fake availability (AGENT_MOCK=1). */
function mockSlots(): DaySlots[] {
  const out: DaySlots[] = [];
  for (let i = 1; out.length < 8; i++) {
    const d = new Date(Date.now() + i * 86_400_000);
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6) continue;
    const date = d.toISOString().slice(0, 10);
    out.push({ date, slots: [12, 13, 14, 16, 17, 19, 20].map((h) => `${date}T${String(h).padStart(2, "0")}:00:00.000Z`) });
  }
  return out;
}
