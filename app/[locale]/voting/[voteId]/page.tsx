import { FC, Suspense } from "react";
import { Movies, VotePage } from "./components/VotePage";
import { FilmCardSkeletonGroup } from "./components/FilmCardSkeleton";
import { ApiCollections } from "@/types/api-collection";
import { AVAIL_LOCALES, AvailableLocales } from "@/lib/constants";
import { getFimComponent } from "./components/FilmCardContent";
import { SaveButtonFallback } from "./components/SaveButton";
import env from "@/env";

type Props = {
  params: Promise<{ locale: string; voteId: string }>;
};

const Page: FC<Props> = async ({ params }) => {
  const { locale, voteId } = await params;
  const lang = (AVAIL_LOCALES.find((x) => x.startsWith(locale ?? "")) ??
    "cz-CZ") as AvailableLocales;
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/films`, {
    method: "GET",
  });
  if (res.status != 200) return "Error during film fetching";
  const films: ApiCollections["film"][number][] = await res.json();

  return (
    <>
      {
        <Suspense
          fallback={
            <>
              <FilmCardSkeletonGroup />
              <FilmCardSkeletonGroup />
              <SaveButtonFallback />
            </>
          }
        >
          <VotePage
            voteId={voteId as string}
            movies={
              films
                ? (films.map((item) => getFimComponent(item, lang)) as Movies[])
                : undefined
            }
            lang={lang}
          />
        </Suspense>
      }
    </>
  );
};

export default Page;
