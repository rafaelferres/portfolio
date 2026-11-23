"use client";

import { useState } from "react";

type FormDict = {
  name: string; email: string; company: string; optional: string; type: string; types: string[];
  message: string; placeholder: string; send: string; required: string; invalidEmail: string;
  successTitle: string; successText: string; copy: string; copied: string; again: string; subject: string;
};

const EMAIL = "rafael@ferres.tech";

export default function ContactForm({ dict, sentText }: { dict: FormDict; sentText: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "fallback">("idle");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!v("name")) errs.name = dict.required;
    if (!v("email")) errs.email = dict.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) errs.email = dict.invalidEmail;
    if (!v("message")) errs.message = dict.required;
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    const text = `${dict.name}: ${v("name")}\n${dict.email}: ${v("email")}\n${dict.company}: ${v("company") || "—"}\n${dict.type}: ${v("type")}\n\n${v("message")}`;
    setBody(text);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: v("name"), email: v("email"), company: v("company"), type: v("type"), message: v("message"), website: v("website") }),
      });
      if (res.ok) { setStatus("sent"); return; }
    } catch {}
    // No email service configured (or it failed): open the visitor's mail app instead.
    setStatus("fallback");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`${dict.subject} — ${v("name")}`)}&body=${encodeURIComponent(text)}`;
  }

  if (status === "sent" || status === "fallback") {
    return (
      <div className="fdone">
        <span className="chip chip--live mono">{dict.successTitle}</span>
        {status === "sent" ? (
          <p>{sentText}</p>
        ) : (
          <>
            <p>
              {dict.successText} <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
            <pre>{body}</pre>
          </>
        )}
        <div className="contact__actions">
          {status === "fallback" && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={async () => {
                try { await navigator.clipboard.writeText(body); setCopied(true); } catch {}
              }}
            >
              {copied ? dict.copied : dict.copy}
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={() => { setStatus("idle"); setCopied(false); }}>
            {dict.again}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form id="cform" noValidate onSubmit={onSubmit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <div className="frow">
        <div className="field">
          <label htmlFor="f-name">{dict.name}</label>
          <input id="f-name" name="name" autoComplete="name" aria-invalid={!!errors.name} />
          {errors.name && <span className="ferr">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="f-email">{dict.email}</label>
          <input id="f-email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
          {errors.email && <span className="ferr">{errors.email}</span>}
        </div>
      </div>
      <div className="frow">
        <div className="field">
          <label htmlFor="f-company">
            {dict.company} <em>{dict.optional}</em>
          </label>
          <input id="f-company" name="company" autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor="f-type">{dict.type}</label>
          <select id="f-type" name="type">
            {dict.types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-message">{dict.message}</label>
        <textarea id="f-message" name="message" rows={5} placeholder={dict.placeholder} aria-invalid={!!errors.message} />
        {errors.message && <span className="ferr">{errors.message}</span>}
      </div>
      <button type="submit" className="btn btn--primary btn--lg fsend" disabled={status === "sending"}>
        {dict.send} ↗
      </button>
    </form>
  );
}
