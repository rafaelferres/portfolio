import en from "@/i18n/dictionaries/en.json";
import pt from "@/i18n/dictionaries/pt.json";
import { site } from "@/lib/site";

const strip = (s: string) => s.replace(/<[^>]+>/g, "");

/** llms.txt (https://llmstxt.org) — a plain-language profile for AI assistants and answer engines. */
export function llmsTxt(full = false): string {
  const t = en;
  const lines: string[] = [];
  lines.push("# Rafael Ferrés — Head of AI");
  lines.push("");
  lines.push(`> ${t.hero.bio} Based in São Paulo, Brazil. ${t.hero.available}.`);
  lines.push("");
  lines.push("Rafael Ferrés is Head of Artificial Intelligence at KHAL, where he leads all AI delivery (8+ projects, a team of 18 through an Engineering Manager and 2 Tech Leads). He has shipped Generative AI in production since early 2023 and built one of the first no-code AI agent platforms with RAG in mid-2023, before OpenAI's GPTs.");
  lines.push("");
  lines.push("## Key facts");
  for (const f of t.hire.facts) lines.push(`- ${f.label}: ${f.value}`);
  lines.push(`- Contact: ${site.email}`);
  lines.push(`- LinkedIn: ${site.linkedin}`);
  lines.push(`- GitHub: ${site.github}`);
  lines.push("");
  lines.push("## Pages");
  lines.push(`- [Portfolio (Portuguese)](${site.url}/pt): main version of the site`);
  lines.push(`- [Portfolio (English)](${site.url}/en)`);
  lines.push(`- [Portfolio (Spanish)](${site.url}/es)`);
  lines.push(`- [Résumé PDF (English)](${site.url}/${en.cv.file})`);
  lines.push(`- [Currículo PDF (Português)](${site.url}/${pt.cv.file})`);
  lines.push(`- [Full profile for LLMs](${site.url}/llms-full.txt)`);
  if (!full) return lines.join("\n") + "\n";

  lines.push("");
  lines.push("## Pioneering projects");
  const n = t.projects.now;
  lines.push(`### ${n.label}: ${n.title}`);
  lines.push(n.text);
  for (const it of t.projects.items) {
    lines.push(`### ${it.title} (${it.period}, ${it.org})`);
    lines.push(`${it.role}. ${it.text} Stack: ${it.tags.join(", ")}.`);
  }
  lines.push(`### ${t.projects.ledLabel}`);
  lines.push(t.projects.ledIntro);
  for (const x of t.projects.led) lines.push(`- ${x.title} (${x.cloud}): ${x.text} Stack: ${x.tags.join(", ")}.`);
  lines.push("");
  lines.push("## Experience");
  for (const j of t.experience.items) {
    lines.push(`- ${j.role} — ${j.company} (${j.period}, ${j.location}): ${j.summary}${j.bullets.length ? " " + j.bullets.join("; ") + "." : ""}`);
  }
  lines.push("");
  lines.push("## About");
  for (const b of t.about.blocks) lines.push(strip(b.text));
  lines.push("");
  lines.push("## Skills");
  for (const p of t.stack.providers) lines.push(`- ${p.name}: ${p.items.join(", ")}`);
  for (const g of t.stack.groups) lines.push(`- ${g.name}: ${g.items.join(", ")}`);
  lines.push("");
  lines.push("## Education");
  for (const d of t.education.degrees) lines.push(`- ${d.degree} — ${d.institution} (${d.period})`);
  lines.push(`- Certifications: ${t.education.certs.join("; ")}`);
  lines.push(`- Languages: ${t.education.languages.map((l) => `${l.name} (${l.level})`).join(", ")}`);
  lines.push("");
  lines.push("## Roles of interest");
  lines.push(t.hire.roles.join(", "));
  return lines.join("\n") + "\n";
}
