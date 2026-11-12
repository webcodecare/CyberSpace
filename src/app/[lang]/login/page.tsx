import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict } from "@/lib/i18n";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import Logo from "@/components/Logo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDict(lang).auth.loginTitle, robots: { index: false } };
}

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <Link href={`/${lang}`}>
            <Logo />
          </Link>
        </div>
        <h1 className="auth-card__title">{t.auth.loginTitle}</h1>
        <p className="auth-card__sub">{t.auth.loginSub}</p>
        <LoginForm lang={lang} />
        <p className="auth-card__switch">
          {t.auth.noAccount}{" "}
          <Link href={`/${lang}/register`} className="auth-link">
            {t.auth.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
