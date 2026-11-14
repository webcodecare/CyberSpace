import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import JobsClient from "./JobsClient";

export default async function JobsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <JobsClient lang={lang} />;
}
