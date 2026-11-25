/** Shared between the agent API route and the browser widget. */

export const AGENT_SECTIONS = ["top", "hire", "projects", "about", "experience", "stack", "education", "writing", "contact"] as const;
export type AgentSection = (typeof AGENT_SECTIONS)[number];

/** Elements the agent may point at (rendered with data-agent="…" on the home page). */
export const AGENT_TARGETS = [
  "offer-assessment",
  "offer-production",
  "offer-advisory",
  "process",
  "now",
  "krun",
  "ferresdb",
  "pioneer-career-test",
  "pioneer-agent-builder",
  "case-sales",
  "case-media",
  "case-pricing",
  "models",
] as const;
export type AgentTarget = (typeof AGENT_TARGETS)[number];

export const TARGET_SECTION: Record<AgentTarget, AgentSection> = {
  "offer-assessment": "hire",
  "offer-production": "hire",
  "offer-advisory": "hire",
  process: "hire",
  now: "projects",
  krun: "projects",
  ferresdb: "projects",
  "pioneer-career-test": "projects",
  "pioneer-agent-builder": "projects",
  "case-sales": "projects",
  "case-media": "projects",
  "case-pricing": "projects",
  models: "stack",
};

export const OFFERS = ["assessment", "production", "advisory"] as const;
export type Offer = (typeof OFFERS)[number];

export const CASES = ["case-sales", "case-media", "case-pricing", "pioneer-career-test", "pioneer-agent-builder", "krun", "none"] as const;

/** A personalised one-page proposal the agent composes for a visitor. */
export type Brief = {
  title: string;
  company?: string;
  context: string;
  challenge: string;
  approach: string[];
  offer: Offer;
  steps: { title: string; text: string }[];
  relatedCase: (typeof CASES)[number];
  nextStep: string;
};

/** URL-safe base64 of UTF-8 JSON, so a brief can live in a link without a database. */
const cut = (s: unknown, n: number) => String(s ?? "").slice(0, n);

/** Clamp a model-produced brief to sane sizes so links stay short and the page never breaks. */
export function cleanBrief(b: Partial<Brief>): Brief {
  return {
    title: cut(b.title, 120),
    company: b.company ? cut(b.company, 80) : undefined,
    context: cut(b.context, 500),
    challenge: cut(b.challenge, 500),
    approach: (Array.isArray(b.approach) ? b.approach : []).slice(0, 6).map((a) => cut(a, 220)),
    offer: OFFERS.includes(b.offer as Offer) ? (b.offer as Offer) : "production",
    steps: (Array.isArray(b.steps) ? b.steps : []).slice(0, 5).map((st) => ({ title: cut(st?.title, 50), text: cut(st?.text, 220) })),
    relatedCase: CASES.includes(b.relatedCase as Brief["relatedCase"]) ? (b.relatedCase as Brief["relatedCase"]) : "none",
    nextStep: cut(b.nextStep, 260),
  };
}

export function encodeBrief(raw: Partial<Brief>): string {
  const b = cleanBrief(raw);
  const bytes = new TextEncoder().encode(JSON.stringify(b));
  let bin = "";
  bytes.forEach((x) => (bin += String.fromCharCode(x)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBrief(s: string): Brief | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const b = JSON.parse(new TextDecoder().decode(bytes));
    if (!b || typeof b.title !== "string" || !Array.isArray(b.approach)) return null;
    return cleanBrief(b);
  } catch {
    return null;
  }
}
