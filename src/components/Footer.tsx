import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import Logo from "./Logo";

export default function Footer({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo light />
          <p className="footer__about">{t.footer.about}</p>
        </div>
        <div>
          <h2 className="footer__h">{t.footer.quick}</h2>
          <ul className="footer__list">
            <li><Link href={`/${lang}/shop`}>{t.nav.shop}</Link></li>
            <li><Link href={`/${lang}/about`}>{t.nav.about}</Link></li>
            <li><Link href={`/${lang}/contact`}>{t.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer__h">{t.footer.contact}</h2>
          <p className="footer__about">Cyberspace.az<br />{t.footer.address}</p>
        </div>
      </div>
      <div className="container footer__legal">© {new Date().getFullYear()} Cyberspace.az. {t.footer.rights}</div>
    </footer>
  );
}
