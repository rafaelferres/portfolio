import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";
import BriefView from "@/components/BriefView";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return {
    title: `${t.agent.page.kicker} — Rafael Ferrés`,
    robots: { index: false, follow: false },
  };
}

export default async function Proposal({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);
  return (
    <>
      <Nav dict={t.nav} locale={locale} />
      <main id="main" className="brief-page">
        <BriefView t={t.agent} offers={t.services.offers} ctaTitle={t.services.ctaTitle} locale={locale} />
      </main>
      <SiteFooter t={t} locale={locale} />
    </>
  );
}
