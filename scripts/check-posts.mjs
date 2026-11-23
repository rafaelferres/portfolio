// Validates every post in content/blog against content/blog/AGENTS.md.
// Usage: npm run check:posts   (exits 1 on any problem)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "content", "blog");
const LOCALES = ["pt", "en", "es"];
const errors = [];
const err = (m) => errors.push(m);

const slugs = fs.readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const slug of slugs) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 60) err(`${slug}: slug inválido`);
  const dates = new Set();
  for (const l of LOCALES) {
    const file = path.join(ROOT, slug, `${l}.mdx`);
    if (!fs.existsSync(file)) { err(`${slug}: falta ${l}.mdx`); continue; }
    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    const where = `${slug}/${l}.mdx`;
    if (!data.title || String(data.title).length > 120) err(`${where}: title ausente ou longo demais`);
    if (!data.description || String(data.description).length > 260) err(`${where}: description ausente ou longa demais`);
    if (!data.date || Number.isNaN(Date.parse(data.date))) err(`${where}: date inválida`);
    else dates.add(new Date(data.date).toISOString());
    if (!Array.isArray(data.tags) || data.tags.length < 1) err(`${where}: tags ausentes`);
    if (!Array.isArray(data.sources) || data.sources.length < 2) err(`${where}: mínimo de 2 fontes`);
    else data.sources.forEach((s, i) => { if (!s?.title || !/^https?:\/\//.test(s?.url ?? "")) err(`${where}: fonte ${i + 1} inválida`); });
    if (/^#\s/m.test(content)) err(`${where}: não use H1 (#) no corpo`);
    if (/<[A-Z][A-Za-z]*[\s/>]/.test(content)) err(`${where}: componentes JSX não são suportados`);
    const words = content.split(/\s+/).filter(Boolean).length;
    if (words < 300) err(`${where}: texto curto demais (${words} palavras)`);
  }
  if (dates.size > 1) err(`${slug}: a data precisa ser a mesma nos três idiomas`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s):\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log(`✓ ${slugs.length} post(s) válidos`);
