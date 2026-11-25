"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { localizedPath } from "@/lib/services";

type NavDict = {
  skip: string;
  home: string;
  about: string;
  experience: string;
  hire: string;
  projects: string;
  [key: string]: string;
  education: string;
  contact: string;
  menu: string;
  close: string;
  language: string;
  localTime: string;
};

function useSaoPauloTime() {
  const [time, setTime] = useState<string>("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Nav({ dict, locale }: { dict: NavDict; locale: Locale }) {
  const pathname = usePathname();
  const time = useSaoPauloTime();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const h = (id: string) => `/${locale}#${id}`;
  const links = [
    { href: `/${locale}`, label: dict.home },
    { href: h("hire"), label: dict.hire },
    { href: h("projects"), label: dict.projects },
    { href: h("about"), label: dict.about },
    { href: h("experience"), label: dict.experience },
    { href: `/${locale}/blog`, label: dict.blog },
    { href: h("contact"), label: dict.contact },
  ];

  const swapLocale = (target: Locale) => localizedPath(pathname ?? `/${locale}`, target);

  const rememberLocale = (target: Locale) => {
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <>
      <a href="#main" className="skip-link">
        {dict.skip}
      </a>
      <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
        <a href={`/${locale}`} className="nav__brand" aria-label="Rafael Ferrés">
          <Logo />
          <span className="nav__name">Rafael Ferrés</span>
        </a>

        <nav className="nav__links" aria-label="Principal">
          {links.map((link, i) => (
            <a key={link.href} href={link.href} className="nav__link">
              <span className="mono nav__index">{String(i).padStart(2, "0")}</span>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav__meta">
          <span className="mono nav__clock" aria-label={`${dict.localTime} ${time}`}>
            <span className="pulse" aria-hidden="true" />
            SP {time}
          </span>
          <div className="locale" role="group" aria-label={dict.language}>
            {locales.map((l) => (
              <Link
                key={l}
                href={swapLocale(l)}
                onClick={() => rememberLocale(l)}
                className={`locale__item mono ${l === locale ? "is-active" : ""}`}
                aria-current={l === locale ? "true" : undefined}
                hrefLang={l}
              >
                {localeLabels[l]}
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="nav__menu mono"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? dict.close : dict.menu}
          </button>
        </div>
      </header>

      <div id="mobile-menu" className={`drawer ${open ? "is-open" : ""}`} hidden={!open}>
        <nav aria-label="Mobile">
          {links.map((link, i) => (
            <a key={link.href} href={link.href} className="drawer__link" onClick={() => setOpen(false)}>
              <span className="mono">{String(i).padStart(2, "0")}</span>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
