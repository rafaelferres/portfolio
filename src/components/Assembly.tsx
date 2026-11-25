"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – plain JS module shared with the artifact preview
import { buildChip } from "@/lib/chip";

type Card = { title: string; period: string; text: string; tags: string[] };
type AssemblyDict = {
  label: string;
  title: string;
  parts: string[];
  intro: { title: string; text: string };
  cards: Card[];
};

const pad = (n: number, l = 2) => String(n).padStart(l, "0");

export default function Assembly({ dict }: { dict: AssemblyDict }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [noWebgl, setNoWebgl] = useState(false);
  const n = dict.parts.length;

  /* ── scroll → progress ── */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = document.getElementById("top");
    const onScroll = () => {
      let p = 1;
      if (!reduced && section && stageRef.current) {
        const vh = window.innerHeight;
        if (window.innerWidth > 920) {
          const r = section.getBoundingClientRect();
          p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
        } else {
          const r = stageRef.current.getBoundingClientRect();
          p = Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 1.5)));
        }
      }
      progressRef.current = p;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ── three.js chip ── */
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const start = () => {
      import("three")
        .then((THREE) => {
          if (disposed || !canvasRef.current || !stageRef.current) return;
          cleanup = buildChip(THREE, canvasRef.current, stageRef.current, () => progressRef.current);
        })
        .catch(() => setNoWebgl(true));
    };
    /* let the intro and the first paint finish before the 3D work */
    const introMs = document.documentElement.classList.contains("rf-seen") ? 0 : 1600;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const timer = window.setTimeout(() => {
      if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 1200 });
      else start();
    }, introMs);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      cleanup();
    };
  }, []);

  const active = Math.min(n, Math.floor((progress / 0.9) * n + 0.001));
  const card = active === 0 ? null : dict.cards[active - 1];

  const jumpTo = useCallback(
    (i: number) => {
      const target = ((i + 1) / n) * 0.9 + 0.005;
      const section = document.getElementById("top");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (section && window.innerWidth > 920 && !reduced) {
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + target * (section.offsetHeight - window.innerHeight), behavior: "smooth" });
      } else {
        progressRef.current = Math.max(progressRef.current, target);
        setProgress(progressRef.current);
      }
    },
    [n]
  );

  return (
    <div className="hero-right">
      <div className={`stage ${noWebgl ? "no-webgl" : ""}`} ref={stageRef}>
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="stage__head mono">
          <span>
            {dict.label} · P/{pad(Math.max(1, Math.min(n, active || 1)))}
          </span>
          <span className="stage__pct">{pad(Math.round(progress * 100), 3)}%</span>
        </div>
        <ol className="parts mono">
          {dict.parts.map((p, i) => (
            <li key={p} className={`${i < active ? "is-on" : ""} ${i === active - 1 ? "is-cur" : ""}`}>
              <button type="button" className="pbtn" aria-label={`P/${pad(i + 1)} ${p}`} title={p} onClick={() => jumpTo(i)}>
                {pad(i + 1)}
              </button>
            </li>
          ))}
        </ol>
        <div className="stage__fallback">{dict.title}</div>
      </div>
      <article className="pcard pop" key={active} aria-live="polite">
        {card ? (
          <>
            <div className="pcard__top mono">
              <span className="pcard__code">
                P/{pad(active)} · {dict.parts[active - 1]}
              </span>
              <span>{card.period}</span>
            </div>
            <h3 className="pcard__title">{card.title}</h3>
            <p className="pcard__text">{card.text}</p>
            <ul className="pcard__tags">
              {card.tags.map((t) => (
                <li key={t} className="chip mono">
                  {t}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="pcard__top mono">
              <span className="pcard__code">P/00</span>
              <span>000%</span>
            </div>
            <h3 className="pcard__title">{dict.intro.title}</h3>
            <p className="pcard__text">{dict.intro.text}</p>
          </>
        )}
      </article>
    </div>
  );
}

