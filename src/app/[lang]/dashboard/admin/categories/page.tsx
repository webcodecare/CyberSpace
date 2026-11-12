import { notFound } from "next/navigation";
import { isLocale, getDict } from "@/lib/i18n";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return <CategoriesClient t={t} />;
}
