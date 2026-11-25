import type { MetadataRoute } from "next";
import { htmlLang, locales } from "@/i18n/config";
import { site } from "@/lib/site";
import { getPosts } from "@/lib/blog";
import { SERVICE_IDS, servicePath } from "@/lib/services";

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
  const blogIndex: MetadataRoute.Sitemap = locales.map((l) => ({
    url: `${site.url}/${l}/blog`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
    alternates: { languages: Object.fromEntries(locales.map((x) => [htmlLang[x], `${site.url}/${x}/blog`])) },
  }));
  const posts: MetadataRoute.Sitemap = getPosts("pt").flatMap((p) =>
    locales.map((l) => ({
      url: `${site.url}/${l}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages: Object.fromEntries(locales.map((x) => [htmlLang[x], `${site.url}/${x}/blog/${p.slug}`])) },
    }))
  );
  const services: MetadataRoute.Sitemap = SERVICE_IDS.flatMap((id) =>
    locales.map((l) => ({
      url: `${site.url}${servicePath(id, l)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      alternates: { languages: Object.fromEntries(locales.map((x) => [htmlLang[x], `${site.url}${servicePath(id, x)}`])) },
    }))
  );
  return [...pages, ...services, ...blogIndex, ...posts, ...files];
}
