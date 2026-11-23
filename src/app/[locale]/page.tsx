import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import Nav from "@/components/Nav";
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
        <span className="section-header__index">§ {pad(index)}</span>
        <span className="section-header__rule" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <h2 className="section-header__title">{title}</h2>
    </Reveal>
  );
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);
  const year = new Date().getFullYear();
  const cvHref = `/${t.cv.file}`;
  const pr = t.projects;
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
                <span>{t.hero.first}</span>
                <span className="hero__name--outline">{t.hero.last}</span>
              </h1>
              <p className="hero__subtitle">{t.hero.subtitle}</p>
              <p className="hero__bio">{t.hero.bio}</p>
              <div className="hero__ctas">
                <a href="#contact" className="btn btn--primary">{t.hero.ctaContact} ↗</a>
                <a href="#experience" className="btn btn--ghost">{t.hero.ctaCareer}</a>
                <a href={cvHref} target="_blank" rel="noopener" className="btn btn--ghost"><Download />{t.cv.download}</a>
              </div>
              <div className="hero-stats">
                {t.hero.stats.map((s) => (
                  <div key={s.label} className="stat">
                    <span className="stat__value">{s.value}</span>
                    <span className="stat__label mono">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Assembly dict={t.assembly} />
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee__track mono">
            {[...site.tools, ...site.tools].map((tool, i) => (
              <span key={`${tool}-${i}`} className="marquee__item">
                <span className="marquee__star">✦</span>
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* ───────── § 01 WHY ME ───────── */}
        <section id="hire" className="section container">
          <SectionHeader index={1} label={t.hire.label} title={t.hire.title} />
          <div className="hire">
            <div className="reasons">
              {t.hire.reasons.map((r, i) => (
                <Reveal key={r.title} className="reason" delay={i * 70}>
                  <span className="mono reason__n">W/{pad(i + 1)}</span>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </Reveal>
              ))}
            </div>
            <Reveal as="aside" className="facts">
              <div className="facts__who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/rafael-avatar.jpg" width={56} height={56} alt="" className="facts__avatar" />
                <div>
                  <p className="facts__name">Rafael Ferrés</p>
                  <p className="facts__role">Head of Artificial Intelligence</p>
                </div>
                <span className="pulse facts__live" aria-hidden="true" />
              </div>
              <h3 className="mono edu__panel-title">{t.hire.factsTitle}</h3>
              <dl>
                {t.hire.facts.map((f) => (
                  <div key={f.label} className="spec__row">
                    <dt className="mono">{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mono edu__panel-title facts__roles-title">{t.hire.rolesTitle}</h3>
              <ul className="roles">
                {t.hire.roles.map((r) => (
                  <li key={r} className="chip chip--lg">{r}</li>
                ))}
              </ul>
              <a href="#contact" className="btn btn--primary facts__cta">{t.hero.ctaContact} ↗</a>
              <a href={cvHref} target="_blank" rel="noopener" className="btn btn--ghost facts__cta facts__cv"><Download />{t.cv.download}</a>
            </Reveal>
          </div>
        </section>

        {/* ───────── § 02 PROJECTS ───────── */}
        <section id="projects" className="section container">
          <SectionHeader index={2} label={pr.label} title={pr.title} />
          <Reveal className="now">
            <div className="now__stat">
              <span className="now__value">{pr.now.stat}</span>
              <span className="mono now__statlabel">{pr.now.statLabel}</span>
            </div>
            <div className="now__body">
              <span className="chip chip--live mono">{pr.now.label}</span>
              <h3 className="now__title">{pr.now.title}</h3>
              <p className="now__text">{pr.now.text}</p>
            </div>
            <div className="org">
              <span className="mono org__title">{pr.now.structTitle}</span>
              <div className="org__head">
                <span className="nav__logo org__me" aria-hidden="true">RF</span>
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

          <h3 className="mono proj__label">{pr.soloLabel}</h3>
          <div className="proj">
            {pr.items.map((it, i) => (
              <Reveal as="article" key={it.code} className="pj" delay={i * 80}>
                <span className="pj__year" aria-hidden="true">2023</span>
                <div className="pj__top mono">
                  <span className="pj__code">{it.code}</span>
                  <span className="chip chip--accent">{pr.badge}</span>
                </div>
                <p className="mono pj__period">{it.period}{it.org ? ` · ${it.org}` : ""}</p>
                <h3 className="pj__title">{it.title}</h3>
                <p className="pj__role">{it.role}</p>
                <p className="pj__text">{it.text}</p>
                <ul className="pcard__tags">
                  {it.tags.map((x) => <li key={x} className="chip mono">{x}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal className="led">
            <div className="led__head">
              <h3 className="mono proj__label">{pr.ledLabel}</h3>
              <p className="led__intro">{pr.ledIntro}</p>
            </div>
            <div className="led__grid">
              {pr.led.map((x) => (
                <article key={x.code} className="lc">
                  <div className="pj__top mono">
                    <span className="pj__code">{x.code}</span>
                    <span className="chip">{x.cloud}</span>
                  </div>
                  <h4 className="lc__title">{x.title}</h4>
                  <p className="lc__text">{x.text}</p>
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
              {t.about.blocks.map((b, i) => (
                <Reveal key={b.kicker} className="about__block" delay={i * 100}>
                  <span className="mono about__kicker">{b.kicker}</span>
                  <p dangerouslySetInnerHTML={{ __html: b.text }} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── § 04 EXPERIENCE ───────── */}
        <section id="experience" className="section container">
          <SectionHeader index={4} label={t.experience.label} title={t.experience.title} />
          <ol className="timeline">
            {t.experience.items.map((job, i) => (
              <Reveal as="li" key={job.code} className="job" delay={Math.min(i, 3) * 60}>
                <div className="job__aside mono">
                  <span className="job__code">{job.code}</span>
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
                  {job.bullets.length > 0 && (
                    <ul className="job__bullets">
                      {job.bullets.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                  )}
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
                <span className="mono prov__code">M/{pad(i + 1)}</span>
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

        {/* ───────── CONTACT ───────── */}
        <section id="contact" className="contact">
          <div className="container contact__grid">
            <Reveal>
              <span className="mono contact__label">→ {t.contact.label}</span>
              <h2 className="contact__title">{t.contact.title}</h2>
              <p className="contact__text">{t.contact.text}</p>
              <p className="contact__or">{t.contact.or}</p>
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

      <footer className="footer">
        <div className="container footer__grid">
          <div className="footer__brand">
            <span className="nav__logo" aria-hidden="true">RF</span>
            <p>Rafael Ferrés</p>
            <p className="mono footer__muted">{t.hero.subtitle}</p>
          </div>
          <nav aria-label={t.footer.index}>
            <h3 className="mono footer__title">{t.footer.index}</h3>
            <ul>
              <li><a href="#hire">{t.nav.hire}</a></li>
              <li><a href="#projects">{t.nav.projects}</a></li>
              <li><a href="#about">{t.nav.about}</a></li>
              <li><a href="#experience">{t.nav.experience}</a></li>
              <li><a href="#education">{t.nav.education}</a></li>
              <li><a href="#contact">{t.nav.contact}</a></li>
            </ul>
          </nav>
          <div>
            <h3 className="mono footer__title">{t.footer.elsewhere}</h3>
            <ul>
              <li><a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a href={cvHref} target="_blank" rel="noopener">{t.cv.download}</a></li>
            </ul>
          </div>
        </div>
        <div className="container footer__bottom mono">
          <span>© {year} Rafael Ferrés. {t.footer.rights}</span>
          <span>{t.footer.coords}</span>
          <a href="#top">↑ {t.footer.back}</a>
        </div>
      </footer>
    </>
  );
}
