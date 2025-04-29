"use client";
import { FC, HTMLAttributes, ReactNode, useCallback, useState } from "react";
import DragCarousel from "./FilmCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { toast } from "sonner";
import { FilmCardSkeletonGroup } from "./FilmCardSkeleton";
import { FloatingFilterButton } from "./FloatingFilterButton";
import { SaveButton, SaveButtonFallback } from "./SaveButton";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ApiCollections } from "@/types/api-collection";
import env from "@/env";
import { areSetsEqual, parseTranslations } from "@/lib/utils";
import { AvailableLocales } from "@/lib/constants";
import { BlockPage } from "./BlockPage";

export type Movies = {
  nodes: ReactNode[];
  id: number;
  block: ApiCollections["festival_block"][number];
};

type VotePageProps = {
  className?: string;
  voteId?: string;
  movies?: Movies[];
  lang: AvailableLocales;
} & HTMLAttributes<HTMLOrSVGElement>;

export const VotePage: FC<VotePageProps> = ({ movies, voteId, lang }) => {
  const client = useQueryClient();
  const [votedFilms, setVotedFilms] = useState<Set<number>>(new Set());

  const { data, isLoading, isError, isFetching } = useQuery<
    ApiCollections["vote"][number]
  >({
    queryKey: ["votedFilms", voteId],
    queryFn: async () => {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL || ""}/vote/${voteId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      try {
        if (data && data.films) {
          setVotedFilms(
            new Set(
              data.films.map(
                (item: ApiCollections["vote_film"][number]) => item.film_id
              )
            )
          );
        }
      } catch (e) {
        console.error(e);
      }
      return data;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (films: Set<number>) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/vote/${voteId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voteId: voteId,
            films: JSON.stringify(Array.from(films)),
            timestamp: new Date().toISOString(),
          }),
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Your work has been submitted", {
        className: "dark:text-white",
        description: "Your vote has been submitted successfully.",
      });
      client.invalidateQueries({
        queryKey: ["votedFilms", voteId],
        exact: true,
      });
    },
    onError: () => {
      toast.error("Error", {
        className: "dark:text-white",
        description: "There was an error submitting your vote.",
        action: {
          label: "Try again",
          onClick: onSubmit,
        },
      });
      client.invalidateQueries({
        queryKey: ["vrotedFilms", voteId],
        exact: true,
      });
    },
  });

  const onSubmit = useCallback(
    debounce(() => {
      mutate(votedFilms);
    }, 200),
    [votedFilms]
  );

  let voting = data?.voting_id as ApiCollections["voting"][number] &
    ApiCollections["voting_translations"][number];
  voting = parseTranslations<
    ApiCollections["voting"][number] &
      ApiCollections["voting_translations"][number]
  >(voting, lang);

  let votingFilmsIds: Set<number> = new Set(
    ((voting?.films ?? []) as ApiCollections["vote_film"][number][]).map(
      (item: ApiCollections["vote_film"][number]) => item.film_id as number
    )
  );

  let userVotedId = new Set(
    ((data?.films ?? []) as ApiCollections["vote_film"][number][]).map(
      (item: ApiCollections["vote_film"][number]) => item.film_id as number
    )
  );

  const orderedByBlockMovies = new Map<string, Movies[]>();

  (movies ?? []).forEach((element: Movies) => {
    if (!orderedByBlockMovies.has(JSON.stringify(element.block))) {
      orderedByBlockMovies.set(JSON.stringify(element.block), []);
    }
    if (votingFilmsIds.has(element.id))
      orderedByBlockMovies.get(JSON.stringify(element.block))!.push(element);
    if (orderedByBlockMovies.get(JSON.stringify(element.block))!.length == 0) {
      orderedByBlockMovies.delete(JSON.stringify(element.block));
    }
  });

  return (
    <>
      {!isError && (
        <div className="flex flex-col w-full gap-20 p-10 items-center h-screen overflow-y-auto ">
          {Array.from(orderedByBlockMovies.keys()).map((item) => {
            return (
              <BlockPage
                key={item}
                block={JSON.parse(item)}
                lang={lang}
                filteredMovies={orderedByBlockMovies.get(item)}
                votedFilms={votedFilms}
                setVotedFilms={(id: number) => {
                  if (!votedFilms.has(id)) {
                    setVotedFilms((prev) => new Set(prev.add(id)));
                  } else {
                    setVotedFilms((prev) => {
                      prev.delete(id);
                      return new Set(prev);
                    });
                  }
                }}
              />
            );
          })}

          {!voting && <SaveButtonFallback />}
          {!!voting && (
            <SaveButton
              isFetching={isFetching}
              isLoading={isLoading}
              isPending={isPending}
              onSubmit={onSubmit}
              maxAmount={votingFilmsIds?.size ?? 0}
              actualAmount={votedFilms.size}
              changed={!areSetsEqual(votedFilms, userVotedId)}
              voteMessage={voting?.submit_text ?? "SAVE/ULOŽIT"}
            />
          )}
          <FloatingFilterButton />
          <ModeToggle />
        </div>
      )}
      {isError && (
        <p className="flex justify-center items-center">
          You have incorrect voteId in url.
        </p>
      )}
    </>
  );
};
