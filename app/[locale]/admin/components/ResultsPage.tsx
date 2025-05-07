"use client";
import { Separator } from "@/components/ui/separator";
import env from "@/env";
import { AvailableLocales } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { FC, HTMLAttributes } from "react";
import { LuLoader } from "react-icons/lu";

type ResultsPageProps = {
  className?: string;
  lang: AvailableLocales;
} & HTMLAttributes<HTMLOrSVGElement>;

export const ResultsPage: FC<ResultsPageProps> = ({
  className,
  lang,
  ...props
}) => {
  const { data, isLoading, isError, isFetching } = useQuery<any>({
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
      const data: any = await response.json();
      return data;
    },
  });

  const scoreBoard: Map<number, number> = new Map();
  (data ?? []).forEach((element: any) => {
    JSON.parse(element.films ?? "[]").forEach((filmId: number) => {
      scoreBoard.set(filmId, (scoreBoard.get(filmId) ?? 0) + 1);
    });
  });

  const scoreBoardSorted = new Map(
    [...scoreBoard.entries()].sort((a, b) => b[1] - a[1])
  );

  let lastValueCount: null | number = null;

  return (
    <div
      {...props}
      className={cn(className, "flex flex-col gap-5 p-4 items-center")}
    >
      <h1 className="p-2">
        {lang == "en-US" ? "Score board" : "Skórovací tabule"}
      </h1>
      {data &&
        Array.from(scoreBoardSorted.entries()).map(([key, value], index) => {
          const shouldBeSeparated =
            lastValueCount != null && lastValueCount != value;
          lastValueCount = value;
          return (
            <>
              {shouldBeSeparated && <Separator />}
              <p key={key}>
                {key} {value}
              </p>
            </>
          );
        })}
      {!data && isLoading && <LuLoader className="animate-spin !w-16 !h-16" />}
    </div>
  );
};
