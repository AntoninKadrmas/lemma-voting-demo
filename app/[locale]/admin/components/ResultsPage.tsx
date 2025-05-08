"use client";
import { Separator } from "@/components/ui/separator";
import env from "@/env";
import { AvailableLocales } from "@/lib/constants";
import { cn, parseTranslations } from "@/lib/utils";
import { ApiCollections } from "@/types/api-collection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, HTMLAttributes, useCallback, useEffect, useState } from "react";
import { LuLoader } from "react-icons/lu";
import { SaveButton } from "../../voting/[voteId]/components/SaveButton";
import { FilmShortContent } from "./FilmShortContent";
import { useRouter } from "next/navigation";

type ResultsPageProps = {
  className?: string;
  lang: AvailableLocales;
  films: ApiCollections["film"][number][];
} & HTMLAttributes<HTMLOrSVGElement>;

type FetchedFilmData = { films: string };

export const ResultsPage: FC<ResultsPageProps> = ({
  className,
  lang,
  films,
  ...props
}) => {
  const COUNTER_UNTIL_REFETCH = 30;
  const client = useQueryClient();
  const [counter, setCounter] = useState(-1);
  const router = useRouter();

  const { data, isLoading, isFetching, error } = useQuery<FetchedFilmData[]>({
    queryKey: ["votedFilms"],
    queryFn: async () => {
      const response = await fetch(`${env.NEXT_PUBLIC_API_URL || ""}/vote`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        if (response.status == 401) router.push(`/${lang.split("-")[0]}/login`);
        const error = await response.json();
        throw new Error(error?.error || "Unknown server error");
      }
      setCounter(COUNTER_UNTIL_REFETCH);
      const data: FetchedFilmData[] = await response.json();
      return data;
    },
  });

  useEffect(() => {
    if (counter > 0) {
      const interval = setInterval(() => {
        setCounter(function (value) {
          if (value > 0) {
            return value - 1;
          }
          return -1;
        });
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [counter]);

  const onSubmit = useCallback(() => {
    setCounter(-1);
    client.invalidateQueries({ queryKey: ["votedFilms"] });
  }, [client]);
  useEffect(() => {
    if (counter == 0) {
      onSubmit();
    }
  }, [onSubmit, counter]);

  const scoreBoard: Map<number, number> = new Map();
  (data ?? []).forEach((element: FetchedFilmData) => {
    JSON.parse(element.films ?? "[]").forEach((filmId: number) => {
      scoreBoard.set(filmId, (scoreBoard.get(filmId) ?? 0) + 1);
    });
  });

  const scoreBoardSorted = new Map(
    [...scoreBoard.entries()].sort((a, b) => b[1] - a[1])
  );

  let lastValueCount: null | number = null;
  let place = 1;
  return (
    <>
      <div
        {...props}
        className={cn(
          className,
          "flex flex-col w-full p-10 items-center h-screen overflow-y-auto",
          "gap-5   p-4 items-center  m-auto py-16"
        )}
      >
        <h1 className="p-2">
          {lang == "en-US" ? "Score board" : "Skórovací tabule"}
        </h1>
        {data &&
          Array.from(scoreBoardSorted.entries()).map(([key, value]) => {
            const shouldBeSeparated =
              lastValueCount != null && lastValueCount != value;
            lastValueCount = value;
            const film: ApiCollections["film"][number] = parseTranslations<
              ApiCollections["film"][number]
            >(films.find((x) => x.id == key)!, lang);
            if (shouldBeSeparated) place++;
            return (
              <>
                {shouldBeSeparated && <Separator className="h-2!" />}
                <p className="text-2xl font-bold w-full">{place}.</p>
                <FilmShortContent film={film} lang={lang} amount={value} />
              </>
            );
          })}
        {!data && isLoading && (
          <LuLoader className="animate-spin !w-16 !h-16" />
        )}
        {error && (
          <p className="w-auto m-auto">
            {lang == "en-US"
              ? "Error while loading the data."
              : "Chyba při načítání dat."}
          </p>
        )}
      </div>
      {data && (
        <SaveButton
          isFetching={isFetching}
          isLoading={isLoading}
          isPending={isFetching}
          onSubmit={onSubmit}
          changed={true}
          counter={counter}
          voteMessage={lang == "en-US" ? "Refetch" : "Znovu dotázat"}
        />
      )}
    </>
  );
};
