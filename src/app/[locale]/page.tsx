import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import Effects from "@/components/Effects";
import SiteFooter from "@/components/SiteFooter";
import { formatDate, getPosts } from "@/lib/blog";
import Reveal from "@/components/Reveal";
import ScrollProgress from "@/components/ScrollProgress";
import Assembly from "@/components/Assembly";
import ContactForm from "@/components/ContactForm";

const pad = (n: number, l = 2) => String(n).padStart(l, "0");

const Download = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
);

function SectionHeader({ index, label, title }: { index: number; label: string; title: string }) {
  return (
    <Reveal className="section-header">
      <div className="section-header__meta mono">
        <span className="section-header__index" data-scramble>§ {pad(index)}</span>
        <span className="section-header__rule" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <h2 className="section-header__title" data-split data-accent>{title}</h2>
    </Reveal>
  );
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);
    const cvHref = `/${t.cv.file}`;
  const sv = t.services;
  const pr = t.projects;
  const latest = getPosts(locale).slice(0, 3);
  const companies = [
    { name: "KHAL", note: "Head of AI" },
    { name: "Cogna Educação", note: "AI Pro Hub" },
    { name: "JBS", note: "" },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: "Rafael Ferrés",
        givenName: "Rafael",
        familyName: "Ferrés",
        jobTitle: "Head of Artificial Intelligence",
        description: t.meta.description,
        image: `${site.url}/rafael.jpg`,
        email: `mailto:${site.email}`,
        url: `${site.url}/${locale}`,
        sameAs: [site.linkedin, site.github],
        worksFor: { "@type": "Organization", name: "KHAL" },
        alumniOf: t.education.degrees.map((d) => ({ "@type": "EducationalOrganization", name: d.institution })),
        address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressCountry: "BR" },
        knowsLanguage: ["pt-BR", "en", "es"],
        knowsAbout: [
          "Generative AI", "Large Language Models", "AI agents", "Retrieval-Augmented Generation", "Machine Learning",
          "LangGraph", "LangChain", "Agno", "Vercel AI SDK", "OpenAI", "Anthropic Claude", "Google Gemini", "AWS", "GCP",
        ],
        hasOccupation: { "@type": "Occupation", name: "Head of AI", occupationLocation: { "@type": "City", name: "São Paulo" } },
      },
      {
        "@type": "ProfilePage",
        "@id": `${site.url}/${locale}#page`,
        url: `${site.url}/${locale}`,
        name: t.meta.title,
        inLanguage: locale === "pt" ? "pt-BR" : locale,
        mainEntity: { "@id": `${site.url}/#person` },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: "Rafael Ferrés",
        inLanguage: ["pt-BR", "en", "es"],
        publisher: { "@id": `${site.url}/#person` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Nav dict={t.nav} locale={locale} />
      <ScrollProgress />
      <Effects />

      <main id="main">
        {/* ───────── HERO + 3D ASSEMBLY ───────── */}
        <section id="top" className="assembly" aria-labelledby="hero-title">
          <div className="assembly__sticky container">
            <div>
              <div className="hero__tags mono">
                <span className="chip chip--live">{t.hero.available}</span>
                <span>{t.hero.location}</span>
              </div>
              <h1 id="hero-title" className="hero__name">
                <span data-split>{t.hero.first}</span>
                <span className="hero__name--outline" data-split>{t.hero.last}</span>
              </h1>
              <p className="hero__subtitle">{t.hero.subtitle}</p>
              <div className="hero__ctas">
                <a href="#contact" className="btn btn--primary">{t.hero.ctaContact} ↗</a>
                <a href="#hire" className="btn btn--ghost">{t.hero.ctaServices}</a>
              </div>
              <div className="hero-stats">
                {t.hero.stats.map((s) => (
                  <div key={s.label} className="stat">
                    <span className="stat__value" data-count>{s.value}</span>
                    <span className="stat__label mono">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Assembly dict={t.assembly} />
          </div>
        </section>

        <div className="bands">
          <div className="band band--lime">
            <span className="band__label mono">{t.bands.worked}</span>
            <div className="band__track" aria-hidden="true">
              <div className="band__row">
                {[0, 1, 2, 3].flatMap((k) =>
                  companies.map((c) => (
                    <span key={`${k}-${c.name}`} style={{ display: "contents" }}>
                      <span className="co">{c.name}{c.note && <small>{c.note}</small>}</span>
                      <span className="co-sep" />
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="band band--dark">
            <span className="band__label mono">{t.bands.tools}</span>
            <div className="band__track" aria-hidden="true">
              <div className="band__row band__row--rev">
                {[...site.tools, ...site.tools].map((tool, i) => (
                  <span key={`${tool}-${i}`} className="tool">{tool}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ───────── § 01 WHY ME ───────── */}
        <section id="hire" className="section container">
          <SectionHeader index={1} label={sv.label} title={sv.title} />
          <div className="reasons svc-kpis">
            {t.hire.reasons.map((r, i) => (
              <Reveal key={r.title} className="reason" delay={i * 70}>
                <span className="reason__kpi" data-count>{r.kpi}</span>
                <h3>{r.short}</h3>
              </Reveal>
            ))}
          </div>
          <div className="offers">
            {sv.offers.map((o, i) => (
              <Reveal key={o.code} className="offer" delay={i * 90}>
                <div className="offer__top mono">
                  <span className="offer__code" data-scramble>{o.code}</span>
                  <span className="offer__dur">{o.duration}</span>
                </div>
                <h3 className="offer__title">{o.title}</h3>
                <p className="offer__text">{o.text}</p>
                <ul className="offer__list">
                  {o.deliverables.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
          <h3 className="mono proj__label">{sv.processTitle}</h3>
          <ol className="steps">
            {sv.steps.map((st, i) => (
              <Reveal as="li" key={st.title} className="step" delay={i * 80}>
                <span className="step__n mono">{pad(i + 1)}</span>
                <span className="step__title">{st.title}</span>
                <span className="step__text">{st.text}</span>
              </Reveal>
            ))}
          </ol>
          <Reveal className="svc-cta">
            <div>
              <p className="svc-cta__title">{sv.ctaTitle}</p>
              <p className="mono svc-cta__text">{sv.ctaText}</p>
            </div>
            <a href="#contact" className="btn btn--primary btn--lg">{t.hero.ctaContact} ↗</a>
          </Reveal>
        </section>

        {/* ───────── § 02 PROJECTS ───────── */}
        <section id="projects" className="section container">
          <SectionHeader index={2} label={pr.label} title={pr.title} />
          <Reveal className="now">
            <div className="now__stat">
              <span className="now__value" data-count>{pr.now.stat}</span>
              <span className="mono now__statlabel">{pr.now.statLabel}</span>
            </div>
            <div className="now__body">
              <span className="chip chip--live mono">{pr.now.label}</span>
              <h3 className="now__title" data-split>{pr.now.title}</h3>
            </div>
            <div className="org">
              <span className="mono org__title">{pr.now.structTitle}</span>
              <div className="org__head">
                <Logo className="nav__logo org__me" />
                <span><b>Rafael Ferrés</b> · Head of AI</span>
              </div>
              <div className="org__grid">
                {pr.now.struct.map((o, i) => (
                  <div key={i} className="org__node">
                    <span className="mono org__lead">{o.lead}</span>
                    <span className="org__scope">{o.scope}</span>
                    <span className="mono org__meta">{o.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>


          <Reveal className="lab">
            <div className="lab__head">
              <div className="pj__top mono">
                <span className="pj__code" data-scramble>{pr.lab.code}</span>
                <span className="chip chip--accent">{pr.lab.badge}</span>
              </div>
              <p className="mono pj__period">{pr.lab.label} · Ferres Labs</p>
              <h3 className="lab__title" data-split>{pr.lab.title}</h3>
              <p className="lab__text">{pr.lab.short}</p>
              <ul className="pcard__tags">
                {pr.lab.tags.map((x) => <li key={x} className="chip mono">{x}</li>)}
              </ul>
              <div className="lab__links">
                {pr.lab.links.map((lk, i) => (
                  <a key={lk.url} href={lk.url} target="_blank" rel="noopener noreferrer" className={`btn ${i === 0 ? "btn--primary" : "btn--ghost"}`}>{lk.label} ↗</a>
                ))}
              </div>
            </div>
            <div className="lab__side">
              <dl className="lab__stats">
                {pr.lab.stats.map((st) => (
                  <div key={st.label} className="lab__stat">
                    <dt className="mono">{st.label}</dt>
                    <dd data-count>{st.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="lab__note">{pr.lab.note}</p>
            </div>
          </Reveal>

          <h3 className="mono proj__label">{pr.soloLabel}</h3>
          <div className="proj">
            {pr.items.map((it, i) => (
              <Reveal as="article" key={it.code} className="pj" delay={i * 80}>
                <span className="pj__year" aria-hidden="true">2023</span>
                <div className="pj__top mono">
                  <span className="pj__code" data-scramble>{it.code}</span>
                  <span className="chip chip--accent">{pr.badge}</span>
                </div>
                <p className="mono pj__period">{it.period}{it.org ? ` · ${it.org}` : ""}</p>
                <h3 className="pj__title">{it.title}</h3>
                <p className="pj__text">{it.short}</p>
                <ul className="pcard__tags">
                  {it.tags.map((x) => <li key={x} className="chip mono">{x}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal className="led">
            <div className="led__head">
              <h3 className="mono proj__label">{pr.ledLabel} · {pr.ledIntro}</h3>
            </div>
            <div className="led__grid">
              {pr.led.map((x) => (
                <article key={x.code} className="lc">
                  <div className="pj__top mono">
                    <span className="pj__code" data-scramble>{x.code}</span>
                    <span className="chip">{x.cloud}</span>
                  </div>
                  <h4 className="lc__title">{x.title}</h4>
                  <ul className="pcard__tags">
                    {x.tags.map((tg) => <li key={tg} className="chip mono">{tg}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal className="tl">
            <h3 className="mono edu__panel-title">{pr.timelineTitle}</h3>
            <ol className="tl__list">
              {pr.timeline.map((e, i) => (
                <li key={e.date} className={`tl__item ${i < 2 ? "is-pioneer" : ""} ${i === pr.timeline.length - 1 ? "is-now" : ""}`}>
                  <span className="tl__dot" aria-hidden="true" />
                  <span className="mono tl__date">{e.date}</span>
                  <span className="tl__text">{e.text}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* ───────── § 03 ABOUT ───────── */}
        <section id="about" className="section container">
          <SectionHeader index={3} label={t.about.label} title={t.about.title} />
          <div className="about-wrap">
            <Reveal as="figure" className="portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rafael.jpg" width={800} height={800} alt={t.about.photoAlt} loading="lazy" decoding="async" />
              <figcaption className="mono"><span>RF-01</span><span>São Paulo · BR</span></figcaption>
            </Reveal>
            <div className="about">
              {t.about.short.map((line, i) => (
                <Reveal key={line} className="about__line" delay={i * 100}>{line}</Reveal>
              ))}
            </div>
          </div>
          <Reveal as="figure" className="neural">
            <canvas aria-hidden="true" />
            <figcaption>
              <span className="mono neural__count"><b data-net-count="">000</b> {t.about.netUnit}</span>
              <span className="neural__cap">{t.about.netCaption}</span>
            </figcaption>
          </Reveal>
        </section>

        {/* ───────── § 04 EXPERIENCE ───────── */}
        <section id="experience" className="section container">
          <SectionHeader index={4} label={t.experience.label} title={t.experience.title} />
          <ol className="timeline">
            {t.experience.items.map((job, i) => (
              <Reveal as="li" key={job.code} className="job" delay={Math.min(i, 3) * 60}>
                <div className="job__aside mono">
                  <span className="job__code" data-scramble>{job.code}</span>
                  <span>{job.period}</span>
                  <span className="job__loc">{job.location}</span>
                </div>
                <div className="job__body">
                  <div className="job__head">
                    <h3 className="job__role">{job.role}</h3>
                    {i === 0 && <span className="chip chip--live mono">{t.experience.current}</span>}
                  </div>
                  <p className="job__company">{job.company}</p>
                  <p className="job__summary">{job.summary}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ───────── § 05 STACK ───────── */}
        <section id="stack" className="section container">
          <SectionHeader index={5} label={t.stack.label} title={t.stack.title} />
          <h3 className="mono proj__label">{t.stack.modelsTitle}</h3>
          <div className="providers">
            {t.stack.providers.map((pv, i) => (
              <Reveal key={pv.name} className="prov" delay={i * 60}>
                <span className="mono prov__code" data-scramble>M/{pad(i + 1)}</span>
                <h4 className="prov__name">{pv.name}</h4>
                <ul className="prov__list">
                  {pv.items.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
          <div className="stack">
            {t.stack.groups.map((g, i) => (
              <Reveal key={g.name} className="stack__group" delay={i * 70}>
                <span className="mono stack__name">S/{pad(i + 1)} — {g.name}</span>
                <ul className="stack__items">
                  {g.items.map((it) => <li key={it} className="chip chip--lg">{it}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────── § 06 EDUCATION ───────── */}
        <section id="education" className="section container">
          <SectionHeader index={6} label={t.education.label} title={t.education.title} />
          <div className="edu">
            <div className="edu__degrees">
              {t.education.degrees.map((d, i) => (
                <Reveal key={d.code} className="degree" delay={i * 80}>
                  <div className="degree__top mono"><span>{d.code}</span><span>{d.period}</span></div>
                  <h3 className="degree__title">{d.degree}</h3>
                  <p className="degree__inst">{d.institution}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="edu__panel" delay={120}>
              <h3 className="mono edu__panel-title">{t.education.certsTitle}</h3>
              <ul className="certs">{t.education.certs.map((c) => <li key={c}>{c}</li>)}</ul>
            </Reveal>
            <Reveal className="edu__panel" delay={180}>
              <h3 className="mono edu__panel-title">{t.education.languagesTitle}</h3>
              <ul className="langs">
                {t.education.languages.map((l) => (
                  <li key={l.name} className="lang">
                    <div className="lang__row"><span>{l.name}</span><span className="mono lang__level">{l.level}</span></div>
                    <div className="lang__bar" aria-hidden="true"><span style={{ width: `${l.pct}%` }} /></div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ───────── § 07 WRITING ───────── */}
        {latest.length > 0 && (
          <section id="writing" className="section container">
            <SectionHeader index={7} label={t.blog.label} title={t.blog.title} />
            <ol className="post-list">
              {latest.map((p) => (
                <li key={p.slug}>
                  <a href={`/${locale}/blog/${p.slug}`} className="post-row">
                    <span className="mono post-row__date">{formatDate(p.date, locale)}</span>
                    <span className="post-row__main">
                      <span className="post-row__title">{p.title}</span>
                    </span>
                    <span className="mono post-row__meta">{p.readingMinutes} {t.blog.read} →</span>
                  </a>
                </li>
              ))}
            </ol>
            <a href={`/${locale}/blog`} className="btn btn--ghost blog-all">{t.blog.all} →</a>
          </section>
        )}

        {/* ───────── CONTACT ───────── */}
        <section id="contact" className="contact">
          <div className="container contact__grid">
            <Reveal>
              <span className="mono contact__label">→ {t.contact.label}</span>
              <h2 className="contact__title" data-split data-accent>{t.contact.title}</h2>
              <p className="contact__text">{t.contact.text}</p>
              <a href={`mailto:${site.email}`} className="contact__email">{site.email}</a>
              <div className="contact__actions">
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">LinkedIn ↗</a>
                <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">GitHub ↗</a>
                <a href={cvHref} target="_blank" rel="noopener" className="btn btn--ghost"><Download />{t.cv.download}</a>
              </div>
            </Reveal>
            <Reveal className="formbox">
              <ContactForm dict={t.contact.form} sentText={t.contact.form.sentText} />
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter t={t} locale={locale} />
    </>
  );
}
