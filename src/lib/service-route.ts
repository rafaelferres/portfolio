import type { Metadata } from "next";
import { htmlLang, isLocale, locales, type Locale } from "@/i18n/config";
import { SERVICE_IDS, SERVICE_SEGMENT, SERVICE_SLUG, getService, serviceBySlug, servicePath } from "@/lib/services";

/** Shared logic for /pt/servicos, /en/services and /es/servicios. */
export function serviceParams(segmentLocale: Locale) {
  return SERVICE_IDS.map((id) => ({ locale: segmentLocale, slug: SERVICE_SLUG[id][segmentLocale] }));
}

export function resolveService(segmentLocale: Locale, locale: string, slug: string) {
  if (!isLocale(locale) || locale !== segmentLocale) return null;
  const id = serviceBySlug(locale, slug);
  return id ? { id, locale } : null;
}

export function serviceMetadata(segmentLocale: Locale, locale: string, slug: string): Metadata {
  const r = resolveService(segmentLocale, locale, slug);
  if (!r) return {};
  const s = getService(r.id, r.locale);
  const path = servicePath(r.id, r.locale);
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: {
      canonical: path,
      languages: { ...Object.fromEntries(locales.map((l) => [htmlLang[l], servicePath(r.id, l)])), "x-default": servicePath(r.id, "pt") },
    },
    openGraph: { type: "website", url: path, title: s.metaTitle, description: s.metaDescription },
    twitter: { card: "summary_large_image", title: s.metaTitle, description: s.metaDescription },
  };
}

export { SERVICE_SEGMENT };
