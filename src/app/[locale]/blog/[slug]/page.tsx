import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { htmlLang, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { formatDate, getPost, getPosts, getSlugs } from "@/lib/blog";
import { site } from "@/lib/site";
import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import Effects from "@/components/Effects";
import SiteFooter from "@/components/SiteFooter";

export function generateStaticParams() {
  return locales.flatMap((locale) => getSlugs().map((slug) => ({ locale, slug })));
}

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = await getPost(slug, locale);
  if (!post) return {};
  return {
    title: `${post.title} — Rafael Ferrés`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: "Rafael Ferrés", url: `${site.url}/${locale}` }],
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: { ...Object.fromEntries(locales.map((l) => [htmlLang[l], `/${l}/blog/${slug}`])), "x-default": `/pt/blog/${slug}` },
      types: { "application/rss+xml": `/${locale}/rss.xml` },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/${locale}/blog/${slug}`,
      publishedTime: post.date,
      authors: ["Rafael Ferrés"],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [t, post] = await Promise.all([getDictionary(locale), getPost(slug, locale)]);
  if (!post) notFound();
  const more = getPosts(locale).filter((p) => p.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: htmlLang[locale],
    keywords: post.tags.join(", "),
    url: `${site.url}/${locale}/blog/${slug}`,
    mainEntityOfPage: `${site.url}/${locale}/blog/${slug}`,
    author: { "@type": "Person", "@id": `${site.url}/#person`, name: "Rafael Ferrés", url: `${site.url}/${locale}` },
    publisher: { "@type": "Person", "@id": `${site.url}/#person`, name: "Rafael Ferrés" },
    citation: post.sources.map((s) => s.url),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Nav dict={t.nav} locale={locale} />
      <ScrollProgress />
      <Effects />
      <main id="main">
        <article id="top" className="container post">
          <header className="post__head">
            <a href={`/${locale}/blog`} className="mono post__back">← {t.blog.back}</a>
            <div className="post__meta mono">
              <span>{t.blog.published} {formatDate(post.date, locale)}</span>
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} {t.blog.read}</span>
            </div>
            <h1 className="post__title" data-split>{post.title}</h1>
            <p className="post__lead">{post.description}</p>
            {post.tags.length > 0 && (
              <ul className="pcard__tags">
                {post.tags.map((tag) => <li key={tag} className="chip mono">{tag}</li>)}
              </ul>
            )}
          </header>

          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

          <footer className="post__foot">
            {post.sources.length > 0 && (
              <section className="post__sources">
                <h2 className="mono">{t.blog.sources}</h2>
                <ol>
                  {post.sources.map((s) => (
                    <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>
                  ))}
                </ol>
              </section>
            )}
            <p className="post__ai mono">{t.blog.aiNote}</p>
            <div className="post__cta">
              <p>{t.blog.cta}</p>
              <a href={`/${locale}#contact`} className="btn btn--primary">{t.blog.ctaButton} ↗</a>
            </div>
          </footer>

          {more.length > 0 && (
            <section className="post__more">
              <h2 className="mono proj__label">{t.blog.more}</h2>
              <ol className="post-list">
                {more.map((p) => (
                  <li key={p.slug}>
                    <a href={`/${locale}/blog/${p.slug}`} className="post-row">
                      <span className="mono post-row__date">{formatDate(p.date, locale)}</span>
                      <span className="post-row__main"><span className="post-row__title">{p.title}</span></span>
                      <span className="mono post-row__meta">→</span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>
      </main>
      <SiteFooter t={t} locale={locale} />
    </>
  );
}
