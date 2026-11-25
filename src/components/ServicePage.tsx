import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import Effects from "@/components/Effects";
import SiteFooter from "@/components/SiteFooter";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { site, whatsappUrl } from "@/lib/site";
import { SERVICE_IDS, SHARED, getService, servicePath, type ServiceId } from "@/lib/services";

const pad = (n: number) => String(n).padStart(2, "0");

export default async function ServicePage({ id, locale }: { id: ServiceId; locale: Locale }) {
  const t = await getDictionary(locale);
  const s = getService(id, locale);
  const sh = SHARED[locale];
  const url = `${site.url}${servicePath(id, locale)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: s.title,
        serviceType: s.kicker.split("·").pop()?.trim(),
        description: s.metaDescription,
        url,
        inLanguage: locale,
        areaServed: "Worldwide",
        availableLanguage: ["pt-BR", "en", "es"],
        provider: { "@type": "Person", "@id": `${site.url}/#person`, name: "Rafael Ferrés", url: site.url },
      },
      {
        "@type": "FAQPage",
        mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Rafael Ferrés", item: `${site.url}/${locale}` },
          { "@type": "ListItem", position: 2, name: sh.breadcrumb, item: `${site.url}/${locale}#hire` },
          { "@type": "ListItem", position: 3, name: s.kicker.split("·").pop()?.trim(), item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Nav dict={t.nav} locale={locale} />
      <ScrollProgress />
      <Effects />
      <main id="main" className="svc-page">
        <header className="container svc-hero">
          <nav className="mono svc-crumbs" aria-label="breadcrumb">
            <a href={`/${locale}`}>Rafael Ferrés</a> / <a href={`/${locale}#hire`}>{sh.breadcrumb}</a>
          </nav>
          <p className="mono svc-kicker">
            {s.kicker} <span className="svc-dur">{s.duration}</span>
          </p>
          <h1 className="svc-title" data-split data-accent>{s.title}</h1>
          <p className="svc-lead">{s.lead}</p>
          <div className="svc-hero__cta">
            <BookButton className="btn btn--primary btn--lg">{sh.ctaButton} ↗</BookButton>
          </div>
        </header>

        <section className="container section svc-sec">
          <h2 className="mono proj__label">{s.forWhoTitle}</h2>
          <ul className="svc-for">
            {s.forWho.map((f, i) => (
              <Reveal as="li" key={f} delay={i * 60}>{f}</Reveal>
            ))}
          </ul>
        </section>

        <section className="container section svc-sec">
          <h2 className="mono proj__label">{s.getTitle}</h2>
          <div className="svc-get">
            {s.get.map((g, i) => (
              <Reveal key={g.title} className="offer" delay={i * 70}>
                <span className="mono offer__code">{pad(i + 1)}</span>
                <h3 className="offer__title">{g.title}</h3>
                <p className="offer__text">{g.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="container section svc-sec">
          <h2 className="mono proj__label">{s.stepsTitle}</h2>
          <ol className="steps">
            {s.steps.map((st, i) => (
              <Reveal as="li" key={st.title} className="step" delay={i * 80}>
                <span className="step__n mono">{pad(i + 1)}</span>
                <span className="step__title">{st.title}</span>
                <span className="step__text">{st.text}</span>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="container section svc-sec">
          <h2 className="mono proj__label">{sh.proofTitle}</h2>
          <div className="reasons svc-kpis">
            {sh.proof.map((p, i) => (
              <Reveal key={p.label} className="reason" delay={i * 70}>
                <span className="reason__kpi" data-count>{p.value}</span>
                <h3>{p.label}</h3>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="container section svc-sec">
          <h2 className="mono proj__label">{sh.faqTitle}</h2>
          <div className="svc-faq">
            {s.faq.map((f) => (
              <details key={f.q} className="svc-faq__item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="container section svc-sec">
          <div className="svc-cta">
            <div>
              <p className="svc-cta__title">{sh.ctaTitle}</p>
              <p className="mono svc-cta__text">{sh.ctaText}</p>
            </div>
            <div className="svc-cta__actions">
              <BookButton className="btn btn--primary btn--lg">{sh.ctaButton} ↗</BookButton>
              <a href={whatsappUrl(locale)} target="_blank" rel="noopener noreferrer" className="btn btn--lg btn--wa-dark">
                <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.24-1.37A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.81.83-3.03-.2-.31a8.2 8.2 0 1 1 6.95 3.86Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47a.9.9 0 0 0-.66.31 2.77 2.77 0 0 0-.86 2.06c0 1.21.88 2.39 1 2.55.12.17 1.74 2.66 4.22 3.73 1.57.68 2.18.74 2.97.62.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg> WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="container section svc-sec">
          <h2 className="mono proj__label">{sh.otherTitle}</h2>
          <div className="svc-other">
            {SERVICE_IDS.filter((o) => o !== id).map((o) => {
              const os = getService(o, locale);
              return (
                <a key={o} href={servicePath(o, locale)} className="svc-other__card">
                  <span className="mono offer__code">{os.kicker}</span>
                  <span className="svc-other__title">{os.title}</span>
                  <span className="mono svc-other__more">{sh.learnMore} →</span>
                </a>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter t={t} locale={locale} />
    </>
  );
}
