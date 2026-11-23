import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { htmlLang, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import "../globals.css";
import "../portfolio.css";
import "../motion.css";
import Loader from "@/components/Loader";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0b0b0a",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: dict.meta.title,
    description: dict.meta.description,
    applicationName: "Rafael Ferrés",
    authors: [{ name: "Rafael Ferrés", url: site.linkedin }],
    creator: "Rafael Ferrés",
    publisher: "Rafael Ferrés",
    keywords: [
      "Rafael Ferrés", "Head of AI", "Head de IA", "Diretor de IA", "AI Engineering Manager", "Gerente de Engenharia de IA",
      "IA Generativa", "Generative AI", "LLM", "Agentes de IA", "AI agents", "RAG", "LangGraph", "LangChain",
      "OpenAI", "Anthropic", "Gemini", "Machine Learning", "São Paulo", "KHAL",
    ],
    category: "technology",
    alternates: {
      canonical: `/${locale}`,
      languages: { ...Object.fromEntries(locales.map((l) => [htmlLang[l], `/${l}`])), "x-default": "/pt" },
    },
    openGraph: {
      type: "profile",
      firstName: "Rafael",
      lastName: "Ferrés",
      url: `/${locale}`,
      siteName: "Rafael Ferrés",
      title: dict.meta.title,
      description: dict.meta.description,
      locale: htmlLang[locale].replace("-", "_"),
      alternateLocale: locales.filter((l) => l !== locale).map((l) => htmlLang[l].replace("-", "_")),
    },
    twitter: { card: "summary_large_image", title: dict.meta.title, description: dict.meta.description },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    formatDetection: { telephone: false },
    other: { "llms-txt": `${site.url}/llms.txt` },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={htmlLang[locale]} className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("rf-loaded"))document.documentElement.classList.add("rf-seen");sessionStorage.setItem("rf-loaded","1")}catch(e){}`,
          }}
        />
        <Loader />
        {children}
      </body>
    </html>
  );
}
