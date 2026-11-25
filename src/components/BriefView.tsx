"use client";

import { useEffect, useState } from "react";
import { decodeBrief, type Brief } from "@/lib/agent";
import type { Dictionary } from "@/i18n/get-dictionary";
import { openBooking } from "@/lib/booking";

const OFFER_INDEX = { assessment: 0, production: 1, advisory: 2 } as const;

/** Renders a proposal the agent encoded in the URL hash (nothing is stored server-side). */
export default function BriefView({
  t,
  offers,
  ctaTitle,
  locale,
}: {
  t: Dictionary["agent"];
  offers: Dictionary["services"]["offers"];
  ctaTitle: string;
  locale: string;
}) {
  const [brief, setBrief] = useState<Brief | null | undefined>(undefined);

  useEffect(() => {
    const read = () => setBrief(decodeBrief(window.location.hash.slice(1)));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (brief === undefined) return <div className="container brief" />;
  if (!brief) {
    return (
      <div className="container brief brief--empty">
        <p>{t.page.invalid}</p>
        <a className="btn btn--primary" href={`/${locale}`}>{t.page.back}</a>
      </div>
    );
  }

  const offer = offers[OFFER_INDEX[brief.offer] ?? 1];
  const related = t.cases[brief.relatedCase as keyof typeof t.cases];

  return (
    <article className="container brief">
      <header className="brief__head">
        <span className="mono brief__kicker">✦ {t.page.kicker}{brief.company ? ` · ${brief.company}` : ""}</span>
        <h1 className="brief__title">{brief.title}</h1>
        <p className="mono brief__gen">{t.page.generated}</p>
      </header>

      <div className="brief__grid">
        <section className="brief__block">
          <h2 className="mono">{t.page.context}</h2>
          <p>{brief.context}</p>
        </section>
        <section className="brief__block">
          <h2 className="mono">{t.page.challenge}</h2>
          <p>{brief.challenge}</p>
        </section>
      </div>

      <section className="brief__block brief__approach">
        <h2 className="mono">{t.page.approach}</h2>
        <ul>
          {brief.approach.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </section>

      {offer && (
        <section className="brief__offer">
          <div>
            <h2 className="mono">{t.page.package}</h2>
            <p className="brief__offer-title">{offer.title}</p>
            <p>{offer.text}</p>
          </div>
          <div className="brief__offer-side">
            <span className="mono brief__dur">{offer.duration}</span>
            <ul>
              {offer.deliverables.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
        </section>
      )}

      <section className="brief__block">
        <h2 className="mono">{t.page.steps}</h2>
        <ol className="steps brief__steps" style={{ gridTemplateColumns: `repeat(${brief.steps.length}, minmax(0, 1fr))` }}>
          {brief.steps.map((s, i) => (
            <li key={s.title} className="step is-visible">
              <span className="step__n mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="step__title">{s.title}</span>
              <span className="step__text">{s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="brief__grid">
        {related && (
          <section className="brief__block">
            <h2 className="mono">{t.page.related}</h2>
            <p>
              <a href={`/${locale}#${brief.relatedCase.startsWith("offer") ? "hire" : "projects"}`}>{related} →</a>
            </p>
          </section>
        )}
        <section className="brief__block">
          <h2 className="mono">{t.page.next}</h2>
          <p>{brief.nextStep}</p>
        </section>
      </div>

      <div className="svc-cta brief__cta">
        <p className="svc-cta__title">{ctaTitle}</p>
        <div className="brief__cta-actions">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => openBooking({ notes: `${t.page.kicker}: ${brief.title}\n${typeof window !== "undefined" ? window.location.href : ""}` })}
          >
            {t.page.cta} ↗
          </button>
          <button type="button" className="btn btn--ghost brief__print" onClick={() => window.print()}>{t.page.print}</button>
        </div>
      </div>

      <p className="mono brief__note">{t.page.note}</p>
    </article>
  );
}
