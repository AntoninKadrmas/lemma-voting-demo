import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { FC } from "react";
import env from "@/env";
import { ResultsPage } from "./components/ResultsPage";
import { ApiCollections } from "@/types/api-collection";

type Props = {
  params: Promise<{ locale: string }>;
};
const AdminPage: FC<Props> = async ({ ...props }) => {
  const { locale } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect(`/${locale}/login`);
  }

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/films`, {
    method: "GET",
  });

  if (res.status != 200) return "Error during film fetching";
  const films: ApiCollections["film"][number][] = await res.json();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
      <ResultsPage />
    </div>
  );
};

export default AdminPage;
