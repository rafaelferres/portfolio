"use client";

import { useState, type FormEvent } from "react";

/** Hero input that hands the visitor's question to the site agent. */
export default function AgentPrompt({ label, placeholder, send }: { label: string; placeholder: string; send: string }) {
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("rf-agent", { detail: q.trim() }));
    setQ("");
  };
  return (
    <form className="aprompt" onSubmit={submit}>
      <label className="mono aprompt__label" htmlFor="aprompt">
        <span className="aprompt__spark" aria-hidden>✦</span> {label}
      </label>
      <div className="aprompt__box">
        <input id="aprompt" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} maxLength={1500} autoComplete="off" />
        <button type="submit" aria-label={send}>↑</button>
      </div>
    </form>
  );
}
