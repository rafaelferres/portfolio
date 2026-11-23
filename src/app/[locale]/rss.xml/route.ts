import { htmlLang, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET(_: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "pt";
  const t = await getDictionary(l);
  const items = getPosts(l)
    .slice(0, 50)
    .map((p) => {
      const url = `${site.url}/${l}/blog/${p.slug}`;
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${esc(p.description)}</description>${p.tags.map((tg) => `<category>${esc(tg)}</category>`).join("")}</item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(`Rafael Ferrés — ${t.blog.label}`)}</title><link>${site.url}/${l}/blog</link><atom:link href="${site.url}/${l}/rss.xml" rel="self" type="application/rss+xml"/><description>${esc(t.blog.intro)}</description><language>${htmlLang[l]}</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
