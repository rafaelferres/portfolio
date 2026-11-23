import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import Logo from "./Logo";

export default function SiteFooter({ t, locale }: { t: Dictionary; locale: Locale }) {
  const year = new Date().getFullYear();
  const cvHref = `/${t.cv.file}`;
  const h = (id: string) => `/${locale}#${id}`;
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>Rafael Ferrés</p>
          <p className="mono footer__muted">{t.hero.subtitle}</p>
        </div>
        <nav aria-label={t.footer.index}>
          <h3 className="mono footer__title">{t.footer.index}</h3>
          <ul>
            <li><a href={h("hire")}>{t.nav.hire}</a></li>
            <li><a href={h("projects")}>{t.nav.projects}</a></li>
            <li><a href={h("about")}>{t.nav.about}</a></li>
            <li><a href={h("experience")}>{t.nav.experience}</a></li>
            <li><a href={`/${locale}/blog`}>{t.nav.blog}</a></li>
            <li><a href={h("contact")}>{t.nav.contact}</a></li>
          </ul>
        </nav>
        <div>
          <h3 className="mono footer__title">{t.footer.elsewhere}</h3>
          <ul>
            <li><a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li><a href={cvHref} target="_blank" rel="noopener">{t.cv.download}</a></li>
            <li><a href={`/${locale}/rss.xml`}>{t.blog.rss}</a></li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom mono">
        <span>© {year} Rafael Ferrés. {t.footer.rights}</span>
        <span>{t.footer.coords}</span>
        <a href="#top">↑ {t.footer.back}</a>
      </div>
    </footer>
  );
}
