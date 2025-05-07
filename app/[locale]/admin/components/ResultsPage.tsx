"use client";
import { Separator } from "@/components/ui/separator";
import env from "@/env";
import { AvailableLocales } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ApiCollections } from "@/types/api-collection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, HTMLAttributes, useEffect, useState } from "react";
import { LuLoader } from "react-icons/lu";
import { SaveButton } from "../../voting/[voteId]/components/SaveButton";

type ResultsPageProps = {
  className?: string;
  lang: AvailableLocales;
  films: ApiCollections["film"][number][];
} & HTMLAttributes<HTMLOrSVGElement>;

type FetchedFilmData = { films: string };

export const ResultsPage: FC<ResultsPageProps> = ({
  className,
  lang,
  ...props
}) => {
  const COUNTER_UNTIL_REFETCH = 30;
  const client = useQueryClient();
  const [counter, setCounter] = useState(-1);
  const { data, isLoading, isFetching } = useQuery<FetchedFilmData[]>({
    queryKey: ["votedFilms"],
    queryFn: async () => {
      const response = await fetch(`${env.NEXT_PUBLIC_API_URL || ""}/vote`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
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

  const onSubmit = () => {
    setCounter(-1);
    client.invalidateQueries({ queryKey: ["votedFilms"] });
  };
  useEffect(() => {
    if (counter == 0) {
      onSubmit();
    }
  }, [onSubmit]);

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

  return (
    <>
      <div
        {...props}
        className={cn(className, "flex flex-col gap-5 p-4 items-center")}
      >
        <h1 className="p-2">
          {lang == "en-US" ? "Score board" : "Skórovací tabule"}
        </h1>
        {data &&
          Array.from(scoreBoardSorted.entries()).map(([key, value]) => {
            const shouldBeSeparated =
              lastValueCount != null && lastValueCount != value;
            lastValueCount = value;
            return (
              <>
                {shouldBeSeparated && <Separator />}
                <p key={key}>
                  {key} - {value}
                </p>
              </>
            );
          })}
        {!data && isLoading && (
          <LuLoader className="animate-spin !w-16 !h-16" />
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
