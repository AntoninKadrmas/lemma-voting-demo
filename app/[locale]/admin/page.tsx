import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { FC } from "react";
import env from "@/env";
import { ResultsPage } from "./components/ResultsPage";
import { ApiCollections } from "@/types/api-collection";
import { AVAIL_LOCALES, AvailableLocales } from "@/lib/constants";

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

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/films`, {
    method: "GET",
  });

  if (res.status != 200) return "Error during film fetching";
  const films: ApiCollections["film"][number][] = await res.json();
  return <ResultsPage films={films} lang={lang} />;
};

export default AdminPage;
