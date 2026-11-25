import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import Effects from "@/components/Effects";
import SiteFooter from "@/components/SiteFooter";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/Reveal";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
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
            <BookButton className="btn btn--primary btn--lg">{sh.ctaButton} ↗</BookButton>
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
