import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { htmlLang, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { formatDate, getPosts } from "@/lib/blog";
import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import Effects from "@/components/Effects";
import SiteFooter from "@/components/SiteFooter";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return {
    title: `${t.blog.label} — Rafael Ferrés`,
    description: t.blog.intro,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { ...Object.fromEntries(locales.map((l) => [htmlLang[l], `/${l}/blog`])), "x-default": "/pt/blog" },
      types: { "application/rss+xml": `/${locale}/rss.xml` },
    },
    openGraph: { title: `${t.blog.label} — Rafael Ferrés`, description: t.blog.intro, url: `/${locale}/blog`, type: "website" },
  };
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);
  const posts = getPosts(locale);

  return (
    <>
      <Nav dict={t.nav} locale={locale} />
      <ScrollProgress />
      <Effects />
      <main id="main">
        <section id="top" className="section container blog-hero">
          <div className="section-header">
            <div className="section-header__meta mono">
              <span className="section-header__index" data-scramble>§ {t.blog.label}</span>
              <span className="section-header__rule" aria-hidden="true" />
              <span>{posts.length} posts</span>
            </div>
            <h1 className="section-header__title blog-hero__title" data-split data-accent>{t.blog.title}</h1>
            <p className="blog-hero__intro">{t.blog.intro}</p>
          </div>
          {posts.length === 0 ? (
            <p className="blog-empty">{t.blog.empty}</p>
          ) : (
            <ol className="post-list">
              {posts.map((p, i) => (
                <li key={p.slug}>
                  <a href={`/${locale}/blog/${p.slug}`} className="post-row tilt-none">
                    <span className="mono post-row__n" data-scramble>B/{String(posts.length - i).padStart(3, "0")}</span>
                    <span className="mono post-row__date">{formatDate(p.date, locale)}</span>
                    <span className="post-row__main">
                      <span className="post-row__title">{p.title}</span>
                      <span className="post-row__desc">{p.description}</span>
                    </span>
                    <span className="mono post-row__meta">{p.readingMinutes} {t.blog.read} →</span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
      <SiteFooter t={t} locale={locale} />
    </>
  );
}
