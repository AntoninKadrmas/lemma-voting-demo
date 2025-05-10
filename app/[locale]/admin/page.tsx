import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { FC } from "react";
import { ResultsPage } from "./components/ResultsPage";
import { ApiCollections } from "@/types/api-collection";
import { AVAIL_LOCALES, AvailableLocales } from "@/lib/constants";
import { authOptions } from "@/lib/authOptions";
import { cookies } from "next/headers";
import env from "@/env";

type Props = {
  params: Promise<{ locale: string }>;
};
const AdminPage: FC<Props> = async ({ ...props }) => {
  const { locale } = await props.params;
  const lang = (AVAIL_LOCALES.find((x) => x.startsWith(locale ?? "")) ??
    "cz-CZ") as AvailableLocales;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const res = await fetch(`${env.NEXT_PUBLIC_URL}api/films`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
      Referer: env.NEXT_PUBLIC_URL,
    },
  });

  if (res.status != 200) return "Error during film fetching";
  const films: ApiCollections["film"][number][] = await res.json();
  return <ResultsPage films={films} lang={lang} />;
};

export default AdminPage;
