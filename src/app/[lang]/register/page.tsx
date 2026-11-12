import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict } from "@/lib/i18n";
import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";
import Logo from "@/components/Logo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDict(lang).auth.registerTitle, robots: { index: false } };
}

export default async function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
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
        <h1 className="auth-card__title">{t.auth.registerTitle}</h1>
        <p className="auth-card__sub">{t.auth.registerSub}</p>
        <RegisterForm lang={lang} />
        <p className="auth-card__switch">
          {t.auth.hasAccount}{" "}
          <Link href={`/${lang}/login`} className="auth-link">
            {t.auth.loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
