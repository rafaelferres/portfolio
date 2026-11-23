import type { MetadataRoute } from "next";
import { htmlLang, locales } from "@/i18n/config";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [htmlLang[l], `${site.url}/${l}`]));
  const now = new Date();
  const pages: MetadataRoute.Sitemap = locales.map((l) => ({
    url: `${site.url}/${l}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: l === "pt" ? 1 : 0.9,
    alternates: { languages },
  }));
  const files = ["cv/curriculo-rafael-ferres-pt.pdf", "cv/resume-rafael-ferres-en.pdf", "cv/cv-rafael-ferres-es.pdf", "llms.txt"].map(
    (f) => ({ url: `${site.url}/${f}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 })
  );
  return [...pages, ...files];
}
