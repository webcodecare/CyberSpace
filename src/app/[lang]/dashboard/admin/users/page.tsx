import { getServerSession } from "@/lib/server-auth";
import { getDict, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const session = await getServerSession();

  return (
    <UsersClient
      lang={lang}
      t={t}
      currentUserId={parseInt(session?.id ?? "0", 10)}
    />
  );
}
