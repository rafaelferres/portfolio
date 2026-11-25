"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { TARGET_SECTION, cleanBrief, encodeBrief, type AgentTarget, type Brief } from "@/lib/agent";
import type { Dictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import { openBooking } from "@/lib/booking";
import BookingWidget from "@/components/BookingWidget";
import { track } from "@/lib/track";

type T = Dictionary["agent"];
type Part = UIMessage["parts"][number] & {
  type: string;
  toolCallId?: string;
  state?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  text?: string;
};

const STORE = "rf-agent-v1";

/* ── tiny, safe markdown: paragraphs, bullets, **bold** ── */
function Md({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  const inline = (raw: string) => {
    const s = raw.replace(/\[([^\]]+)\]\((?:https?:\/\/|\/)[^)\s]+\)/g, "$1");
    return s.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
      seg.startsWith("**") && seg.endsWith("**") ? <strong key={i}>{seg.slice(2, -2)}</strong> : <span key={i}>{seg}</span>,
    );
  };
  return (
    <>
      {blocks.flatMap((b, i) => {
        /* split a block into runs of plain lines and bullet lines */
        const runs: { list: boolean; lines: string[] }[] = [];
        for (const l of b.split("\n")) {
          const list = /^\s*([-*•]|\d+\.)\s+/.test(l);
          const last = runs[runs.length - 1];
          if (last && last.list === list) last.lines.push(l);
          else runs.push({ list, lines: [l] });
        }
        return runs.map((r, j) =>
          r.list ? (
            <ul key={`${i}-${j}`}>
              {r.lines.map((l, k) => (
                <li key={k}>{inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</li>
              ))}
            </ul>
          ) : (
            <p key={`${i}-${j}`}>
              {r.lines.map((l, k) => (
                <span key={k}>
                  {k > 0 && <br />}
                  {inline(l)}
                </span>
              ))}
            </p>
          ),
        );
      })}
    </>
  );
}

/** Scroll the page to a target/section and flash it. */
function showOnPage(target?: string, section?: string) {
  const el =
    (target && document.querySelector<HTMLElement>(`[data-agent="${target}"]`)) ||
    (section && document.getElementById(section)) ||
    (target && document.getElementById(TARGET_SECTION[target as AgentTarget] ?? ""));
  if (!el) return false;
  el.querySelectorAll<HTMLElement>(".reveal, [data-split]").forEach((n) => n.classList.add("is-visible"));
  el.classList.add("is-visible");
  el.scrollIntoView({ behavior: "smooth", block: target ? "center" : "start" });
  if (target) {
    el.classList.remove("agent-hl");
    void el.offsetWidth;
    el.classList.add("agent-hl");
    window.setTimeout(() => el.classList.remove("agent-hl"), 3200);
  }
  return true;
}

function bookingNotes(reason: string, messages: UIMessage[]) {
  const convo = transcriptOf(messages).slice(-1200);
  return [`Via agente do site${reason ? ` — ${reason}` : ""}`, convo].filter(Boolean).join("\n\n");
}

function transcriptOf(messages: UIMessage[]) {
  return messages
    .map((m) => {
      const text = (m.parts as Part[]).filter((p) => p.type === "text").map((p) => p.text).join("").trim();
      return text ? `${m.role === "user" ? "Visitante" : "Agente"}: ${text}` : "";
    })
    .filter(Boolean)
    .join("\n\n")
    .slice(-12000);
}

export default function Agent({ t, booking, locale }: { t: T; booking: Dictionary["booking"]; locale: string }) {
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const pendingNav = useRef<string | null>(null);
  const restored = useRef(false);
  const [booked, setBooked] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/agent", body: () => ({ locale: localeRef.current }) }),
    [],
  );

  const { messages, sendMessage, addToolOutput, status, error, setMessages, stop, clearError, regenerate } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall({ toolCall }) {
      if (toolCall.dynamic || ("invalid" in toolCall && toolCall.invalid)) return;
      const args = (toolCall.input ?? {}) as Record<string, string>;
      if (toolCall.toolName === "navigate") {
        const ok = showOnPage(args.target, args.section);
        if (window.matchMedia("(max-width: 720px)").matches) setPeek(true);
        addToolOutput({ tool: "navigate", toolCallId: toolCall.toolCallId, output: ok ? "shown" : "not found" });
      } else if (toolCall.toolName === "setLocale") {
        addToolOutput({ tool: "setLocale", toolCallId: toolCall.toolCallId, output: "switching" });
        sessionStorage.setItem(`${STORE}-open`, "1");
        window.setTimeout(() => {
          const rest = window.location.pathname.replace(/^\/(pt|en|es)(?=\/|$)/, "");
          window.location.assign(`/${args.locale}${rest}${window.location.hash}`);
        }, 900);
      } else if (toolCall.toolName === "openPost") {
        const slug = String(args.slug ?? "").replace(/[^a-z0-9-]/gi, "");
        addToolOutput({ tool: "openPost", toolCallId: toolCall.toolCallId, output: "opening" });
        if (slug) pendingNav.current = `/${localeRef.current}/blog/${slug}`;
      } else if (toolCall.toolName === "showBrief") {
        track("brief_created", { offer: String((toolCall.input as Partial<Brief>)?.offer ?? "") });
        const url = `/${localeRef.current}/proposta#${encodeBrief(toolCall.input as Partial<Brief>)}`;
        addToolOutput({ tool: "showBrief", toolCallId: toolCall.toolCallId, output: { shown: true, url } });
      }
      // requestContact waits for the visitor (rendered as a form below).
    },
  });

  useEffect(() => {
    const onBooked = () => setBooked(true);
    window.addEventListener("rf-booked", onBooked);
    return () => window.removeEventListener("rf-booked", onBooked);
  }, []);

  /* persist the conversation for language switches / reloads */
  useEffect(() => {
    if (!restored.current) return;
    if (status === "ready" || status === "error") {
      try {
        sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-40)));
      } catch {}
      /* the agent asked to open a page: go once its reply has finished, keeping the chat open */
      const to = pendingNav.current;
      if (to && status === "ready") {
        pendingNav.current = null;
        sessionStorage.setItem(`${STORE}-open`, "1");
        if (window.location.pathname !== to) window.setTimeout(() => window.location.assign(to), 700);
      }
    }
  }, [messages, status]);

  /* restore the conversation after hydration (server has no sessionStorage) */
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) ?? "[]") as UIMessage[];
      if (saved.length) setMessages(saved);
    } catch {}
    restored.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(`${STORE}-open`)) {
      sessionStorage.removeItem(`${STORE}-open`);
      setOpen(true);
    }
  }, []);

  /* open from anywhere: window.dispatchEvent(new CustomEvent("rf-agent", { detail: "question" })) */
  const ask = useCallback(
    (text: string) => {
      const q = text.trim().slice(0, 1500);
      if (!q || status === "streaming" || status === "submitted") return;
      if (!messages.some((m) => m.role === "user")) track("agent_message", { locale: localeRef.current });
      clearError();
      sendMessage({ text: q });
    },
    [sendMessage, status, clearError, messages],
  );
  useEffect(() => {
    const onAsk = (e: Event) => {
      setOpen(true);
      setPeek(false);
      const q = (e as CustomEvent<string>).detail;
      if (q) ask(q);
      else window.setTimeout(() => inputRef.current?.focus(), 250);
    };
    window.addEventListener("rf-agent", onAsk);
    return () => window.removeEventListener("rf-agent", onAsk);
  }, [ask]);

  useEffect(() => {
    if (open) track("agent_open", { locale });
  }, [open, locale]);

  /* CV downloads anywhere on the page */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href*='/cv/']");
      if (a) track("cv_download", { locale });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.toggle("agent-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";
  const last = messages[messages.length - 1];
  const lastParts = (last?.parts ?? []) as Part[];
  const lastHasContent = last?.role === "assistant" && lastParts.some((p) => (p.type === "text" && p.text?.trim()) || p.type.startsWith("tool-"));
  /* the turn ended but nothing usable came back (no reply, or a tool call that never completed) */
  const stalled =
    status === "ready" &&
    !!last &&
    (last.role === "user" ||
      (lastParts.length > 0 &&
        (() => {
          const tail = lastParts[lastParts.length - 1];
          return tail.type.startsWith("tool-") && tail.type !== "tool-requestContact" && tail.type !== "tool-scheduleCall" && tail.state !== "output-available" && tail.state !== "output-error";
        })()));
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    ask(input);
    setInput("");
    setPeek(false);
  };

  const reset = () => {
    stop();
    setMessages([]);
    sessionStorage.removeItem(STORE);
  };

  const limited = error && /429|Too many/i.test(String(error.message));

  return (
    <>
      <button
        type="button"
        className={`agent-fab ${open ? "is-hidden" : ""}`}
        onClick={() => {
          setOpen(true);
          setPeek(false);
          window.setTimeout(() => inputRef.current?.focus(), 250);
        }}
        aria-haspopup="dialog"
      >
        <span className="agent-fab__dot" aria-hidden />
        {t.open}
      </button>

      <aside className={`agent ${open ? "is-open" : ""} ${peek ? "is-peek" : ""}`} role="dialog" aria-label={t.title} aria-hidden={!open}>
        <header className="agent__head" onClick={() => peek && setPeek(false)}>
          <div className="agent__id">
            <span className="agent__avatar" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" /></svg>
            </span>
            <div>
              <p className="agent__title">{t.title}</p>
              <p className="mono agent__sub">{busy ? t.thinking : t.subtitle}</p>
            </div>
          </div>
          <div className="agent__actions">
            {messages.length > 0 && (
              <button type="button" className="agent__icon" onClick={reset} title={t.reset} aria-label={t.reset}>↺</button>
            )}
            <button type="button" className="agent__icon" onClick={() => setOpen(false)} title={t.close} aria-label={t.close}>✕</button>
          </div>
        </header>

        <div className="agent__list" ref={listRef} aria-live="polite">
          <div className="amsg amsg--bot"><Md text={t.hello} /></div>
          {messages.length === 0 && (
            <div className="agent__chips">
              {t.suggestions.map((s) => (
                <button key={s} type="button" className="agent__chip" onClick={() => ask(s)}>{s}</button>
              ))}
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className="agent__turn">
              {(m.parts as Part[]).map((p, i) => {
                const key = `${m.id}-${i}`;
                if (p.type === "text" && p.text?.trim()) {
                  return (
                    <div key={key} className={`amsg ${m.role === "user" ? "amsg--me" : "amsg--bot"}`}>
                      {m.role === "user" ? p.text : <Md text={p.text} />}
                    </div>
                  );
                }
                if (p.type === "tool-navigate") {
                  return <div key={key} className="mono agent__event">↳ {t.navigating}</div>;
                }
                if (p.type === "tool-scheduleCall" && p.toolCallId) {
                  const reason = String(p.input?.reason ?? "");
                  const out = (p.output ?? {}) as { booked?: boolean };
                  if (p.state === "output-available") {
                    return out.booked ? <div key={key} className="amsg amsg--ok">✓ {t.booked}</div> : (
                      <button key={key} type="button" className="agent__chip agent__retry" onClick={() => openBooking({ notes: bookingNotes(reason, messages) })}>
                        📅 {t.openCalendar}
                      </button>
                    );
                  }
                  if (p.state !== "input-available") return null;
                  return (
                    <BookingWidget
                      key={key}
                      t={booking}
                      locale={locale}
                      compact
                      notes={bookingNotes(reason, messages)}
                      onBooked={(b) => addToolOutput({ tool: "scheduleCall", toolCallId: p.toolCallId!, output: { booked: true, start: b.start } })}
                      onSkip={() => addToolOutput({ tool: "scheduleCall", toolCallId: p.toolCallId!, output: { booked: false, declined: true } })}
                    />
                  );
                }
                if (p.type === "tool-openPost") {
                  return <div key={key} className="mono agent__event">↳ {t.openingPost}</div>;
                }
                if (p.type === "tool-setLocale") {
                  return <div key={key} className="mono agent__event">↳ {t.switching}</div>;
                }
                if (p.type === "tool-showBrief") {
                  if (p.input && (p.state === "input-available" || p.state === "output-available")) {
                    return <BriefCard key={key} brief={cleanBrief(p.input as Partial<Brief>)} t={t} locale={locale} />;
                  }
                  if (p.state === "input-streaming" && busy) return <div key={key} className="mono agent__event agent__event--live">✦ {t.building}</div>;
                  return null;
                }
                if (p.type === "tool-requestContact" && p.toolCallId) {
                  return (
                    <LeadForm
                      key={key}
                      t={t}
                      state={p.state ?? ""}
                      output={p.output}
                      reason={String(p.input?.reason ?? "")}
                      onDone={(output) => addToolOutput({ tool: "requestContact", toolCallId: p.toolCallId!, output })}
                      getTranscript={() => transcriptOf(messages)}
                      getBriefUrl={() => {
                        const b = [...messages].reverse().flatMap((mm) => mm.parts as Part[]).find((pp) => pp.type === "tool-showBrief" && pp.input);
                        return b ? `/${locale}/proposta#${encodeBrief(b.input as Partial<Brief>)}` : "";
                      }}
                      locale={locale}
                    />
                  );
                }
                return null;
              })}
            </div>
          ))}

          {booked && messages.length > 0 && <div className="amsg amsg--ok">✓ {t.booked}</div>}
          {stalled && !error && (
            <button type="button" className="agent__chip agent__retry" onClick={() => { clearError(); regenerate(); }}>↻ {t.retry}</button>
          )}
          {(status === "submitted" || (status === "streaming" && !lastHasContent)) && (
            <div className="amsg amsg--bot amsg--typing" aria-label={t.thinking}><span /><span /><span /></div>
          )}
          {error && (
            <div className="amsg amsg--err">
              {limited ? t.limit : t.error}
              {!limited && (
                <button type="button" className="agent__chip agent__retry" onClick={() => { clearError(); regenerate(); }}>↻ {t.retry}</button>
              )}
            </div>
          )}
        </div>

        <form className="agent__form" onSubmit={onSubmit}>
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            maxLength={1500}
            placeholder={t.placeholder}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setPeek(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) onSubmit(e);
            }}
            aria-label={t.placeholder}
          />
          <button type="submit" className="agent__send" disabled={busy || !input.trim()} aria-label={t.send}>↑</button>
        </form>
        <p className="mono agent__disclaimer">{t.disclaimer}</p>
      </aside>
    </>
  );
}

function BriefCard({ brief, t, locale }: { brief: Brief; t: T; locale: string }) {
  const [copied, setCopied] = useState(false);
  const url = `/${locale}/proposta#${encodeBrief(brief)}`;
  return (
    <div className="abrief">
      <span className="mono abrief__k">{t.briefLabel} · {t.offers[brief.offer] ?? ""}</span>
      <p className="abrief__title">{brief.title}</p>
      <ul className="abrief__list">
        {brief.approach.slice(0, 3).map((a) => <li key={a}>{a}</li>)}
      </ul>
      <div className="abrief__actions">
        <a href={url} target="_blank" rel="noopener" className="btn btn--primary">{t.briefOpen} ↗</a>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.origin + url).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? t.copied : t.briefCopy}
        </button>
      </div>
    </div>
  );
}

function LeadForm({
  t,
  state,
  output,
  reason,
  onDone,
  getTranscript,
  getBriefUrl,
  locale,
}: {
  t: T;
  state: string;
  output: unknown;
  reason: string;
  onDone: (o: { sent: boolean; declined?: boolean }) => void;
  getTranscript: () => string;
  getBriefUrl: () => string;
  locale: string;
}) {
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [who, setWho] = useState<{ name?: string; email?: string }>({});
  const done = state === "output-available";
  const o = (output ?? {}) as { sent?: boolean; declined?: boolean };

  if (done) {
    if (o.sent)
      return (
        <div className="amsg amsg--ok">
          ✓ {t.lead.sent}
          <button type="button" className="agent__chip agent__retry" onClick={() => openBooking({ ...who, notes: bookingNotes(reason, []) })}>
            📅 {t.bookNow}
          </button>
        </div>
      );
    return null;
  }
  if (state !== "input-available") return null;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSending(true);
    setFailed(false);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          company: f.get("company"),
          phone: f.get("phone"),
          website: f.get("website"),
          consent: f.get("consent") === "on",
          reason,
          locale,
          briefUrl: getBriefUrl(),
          transcript: getTranscript(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setWho({ name: String(f.get("name") ?? ""), email: String(f.get("email") ?? "") });
      track("lead_sent", { locale }, { beacon: false });
      onDone({ sent: true });
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="alead" onSubmit={submit}>
      <p className="alead__title">{t.lead.title}</p>
      <input name="name" required autoComplete="name" placeholder={t.lead.name} maxLength={120} />
      <input name="email" type="email" required autoComplete="email" placeholder={t.lead.email} maxLength={160} />
      <div className="alead__row">
        <input name="company" autoComplete="organization" placeholder={t.lead.company} maxLength={120} />
        <input name="phone" type="tel" autoComplete="tel" placeholder={t.lead.phone} maxLength={40} />
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" className="alead__hp" aria-hidden />
      <label className="alead__consent">
        <input type="checkbox" name="consent" required />
        <span>{t.lead.consent}</span>
      </label>
      {failed && (
        <p className="alead__fail">
          {t.lead.fallback} <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      )}
      <div className="alead__actions">
        <button type="submit" className="btn btn--primary" disabled={sending}>{sending ? t.lead.sending : t.lead.submit}</button>
        <button type="button" className="btn btn--ghost" onClick={() => onDone({ sent: false, declined: true })}>{t.lead.skip}</button>
      </div>
    </form>
  );
}
