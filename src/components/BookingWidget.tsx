"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import { track } from "@/lib/track";

type T = Dictionary["booking"];
type Day = { date: string; slots: string[] };
export type Booked = { start: string; email: string };

const LOCALE_TAG: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

/** Booking flow in the site's own design, backed by the Cal.com API. */
export default function BookingWidget({
  t,
  locale,
  notes = "",
  name = "",
  email = "",
  compact = false,
  onBooked,
  onSkip,
}: {
  t: T;
  locale: string;
  notes?: string;
  name?: string;
  email?: string;
  compact?: boolean;
  onBooked?: (b: Booked) => void;
  onSkip?: () => void;
}) {
  const tz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
    } catch {
      return "America/Sao_Paulo";
    }
  }, []);
  const tag = LOCALE_TAG[locale] ?? "pt-BR";
  const [days, setDays] = useState<Day[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [done, setDone] = useState<Booked | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    track("booking_open", { from: compact ? "agent" : "site" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    setDays(null);
    setFailed(false);
    fetch(`/api/booking/slots?tz=${encodeURIComponent(tz)}`)
      .then((r) => r.json())
      .then((j: { ok: boolean; days: Day[] }) => {
        if (!alive) return;
        if (!j.ok) setFailed(true);
        setDays(j.days ?? []);
      })
      .catch(() => alive && (setFailed(true), setDays([])));
    return () => {
      alive = false;
    };
  }, [tz, reload]);

  const fmtDay = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    return {
      wd: new Intl.DateTimeFormat(tag, { weekday: "short" }).format(d).replace(".", ""),
      n: d.getDate(),
      m: new Intl.DateTimeFormat(tag, { month: "short" }).format(d).replace(".", ""),
    };
  };
  const fmtTime = (iso: string) => new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));
  const fmtFull = (iso: string) =>
    new Intl.DateTimeFormat(tag, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));
  const tzLabel = tz === "America/Sao_Paulo" ? "São Paulo" : tz.replace(/_/g, " ").split("/").pop();
  const calUrl = `https://cal.com/${site.calLink}`;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!slot) return;
    const f = new FormData(e.currentTarget);
    setSending(true);
    setError(false);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: slot,
          name: f.get("name"),
          email: f.get("email"),
          company: f.get("company"),
          notes: f.get("notes"),
          website: f.get("website"),
          tz,
          locale,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error();
      const b = { start: j.start || slot, email: String(f.get("email")) };
      setDone(b);
      track("booking_confirmed", { from: compact ? "agent" : "site" }, { beacon: false });
      onBooked?.(b);
    } catch {
      setError(true);
      setSlot(null);
      setReload((x) => x + 1);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className={`bk bk--done ${compact ? "bk--compact" : ""}`}>
        <span className="bk__check" aria-hidden>✓</span>
        <p className="bk__title">{t.done}</p>
        <p className="bk__when">{fmtFull(done.start)}</p>
        <p className="bk__muted">
          {t.doneText} <strong>{done.email}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className={`bk ${compact ? "bk--compact" : ""}`}>
      {!compact && (
        <header className="bk__head">
          <p className="mono bk__k">{t.duration}</p>
          <p className="bk__title">{t.title}</p>
          <p className="bk__muted">{t.subtitle}</p>
        </header>
      )}

      {days === null && <div className="bk__loading mono">{t.loading}</div>}

      {days !== null && days.length === 0 && (
        <div className="bk__empty">
          <p>{failed ? t.error : t.none}</p>
          <a className="btn btn--ghost" href={calUrl} target="_blank" rel="noopener">{t.fallback} ↗</a>
        </div>
      )}

      {days && days.length > 0 && !slot && (
        <>
          <div className="bk__days" role="tablist" aria-label={t.pick}>
            {days.map((d, i) => {
              const f = fmtDay(d.date);
              return (
                <button key={d.date} type="button" role="tab" aria-selected={i === day} className={`bk__day ${i === day ? "is-on" : ""}`} onClick={() => setDay(i)}>
                  <span className="mono bk__wd">{f.wd}</span>
                  <span className="bk__n">{f.n}</span>
                  <span className="mono bk__m">{f.m}</span>
                </button>
              );
            })}
          </div>
          <p className="mono bk__tz">
            {t.tz} {tzLabel}
          </p>
          <div className="bk__slots">
            {days[day].slots.map((s) => (
              <button
                key={s}
                type="button"
                className="bk__slot"
                onClick={() => {
                  setSlot(s);
                  track("booking_slot_selected", { from: compact ? "agent" : "site" });
                }}
              >
                {fmtTime(s)}
              </button>
            ))}
          </div>
          {error && <p className="bk__error">{t.error}</p>}
          {onSkip && (
            <button type="button" className="bk__skip" onClick={onSkip}>
              {t.skip}
            </button>
          )}
        </>
      )}

      {slot && (
        <form className="bk__form" onSubmit={submit}>
          <div className="bk__picked">
            <span>📅 {fmtFull(slot)}</span>
            <button type="button" className="bk__change" onClick={() => setSlot(null)}>
              {t.change}
            </button>
          </div>
          <div className="bk__row">
            <input name="name" required autoComplete="name" placeholder={t.name} defaultValue={name} maxLength={120} />
            <input name="email" type="email" required autoComplete="email" placeholder={t.email} defaultValue={email} maxLength={160} />
          </div>
          <input name="company" autoComplete="organization" placeholder={t.company} maxLength={120} />
          {!compact && <textarea name="notes" rows={3} placeholder={t.notes} defaultValue={notes} maxLength={1800} />}
          {compact && <input type="hidden" name="notes" value={notes} />}
          <input name="website" tabIndex={-1} autoComplete="off" className="alead__hp" aria-hidden />
          <button type="submit" className="btn btn--primary bk__confirm" disabled={sending}>
            {sending ? t.confirming : `${t.confirm} ↗`}
          </button>
        </form>
      )}
    </div>
  );
}
