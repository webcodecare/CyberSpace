import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { FadeDown } from "@/components/Motion";
import CareersClient from "@/components/careers/CareersClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return pageMeta(lang, "/careers", t.careers.title, t.careers.sub);
}

export default async function CareersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <>
      <section className="page-hero container">
        <FadeDown>
          <h1>{t.careers.title}</h1>
          <p className="muted">{t.careers.sub}</p>
        </FadeDown>
      </section>
      <section className="container section">
        <CareersClient />
      </section>
    </>
  );
}
