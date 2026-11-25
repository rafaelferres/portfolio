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
export function encodeBrief(b: Brief): string {
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
    return b as Brief;
  } catch {
    return null;
  }
}
