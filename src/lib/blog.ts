import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import type { Locale } from "@/i18n/config";

/** Posts live in content/blog/<slug>/<locale>.mdx (see content/blog/AGENTS.md). */
const ROOT = path.join(process.cwd(), "content", "blog");

export type Source = { title: string; url: string };
export type PostMeta = {
  slug: string;
  locale: Locale;
  title: string;
  description: string;
  date: string; // ISO 8601
  tags: string[];
  sources: Source[];
  readingMinutes: number;
};
export type Post = PostMeta & { html: string };

function readFile(slug: string, locale: Locale) {
  const file = path.join(ROOT, slug, `${locale}.mdx`);
  if (!fs.existsSync(file)) return null;
  return matter(fs.readFileSync(file, "utf8"));
}

function toMeta(slug: string, locale: Locale, data: Record<string, unknown>, content: string): PostMeta {
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    locale,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: new Date(String(data.date ?? Date.now())).toISOString(),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    sources: Array.isArray(data.sources) ? (data.sources as Source[]) : [],
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

export function getSlugs(): string[] {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/** All posts for a locale, newest first. Falls back to Portuguese when a translation is missing. */
export function getPosts(locale: Locale): PostMeta[] {
  return getSlugs()
    .map((slug) => {
      const f = readFile(slug, locale) ?? readFile(slug, "pt");
      return f ? toMeta(slug, locale, f.data, f.content) : null;
    })
    .filter((p): p is PostMeta => !!p && new Date(p.date).getTime() <= Date.now() + 60_000)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getPost(slug: string, locale: Locale): Promise<Post | null> {
  const f = readFile(slug, locale) ?? readFile(slug, "pt");
  if (!f) return null;
  const html = String(
    await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeSlug).use(rehypeStringify).process(f.content)
  );
  return { ...toMeta(slug, locale, f.data, f.content), html };
}

export function formatDate(iso: string, locale: Locale) {
  const tag = locale === "pt" ? "pt-BR" : locale;
  return new Intl.DateTimeFormat(tag, { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(iso));
}
