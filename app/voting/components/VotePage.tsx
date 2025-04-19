"use client";
import { FC, HTMLAttributes, ReactNode, useCallback, useState } from "react";
import DragCarousel from "./FilmCard";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { toast } from "sonner";
import { VoteType } from "./FilmType";
import { FilmCardSkeletonGroup } from "./FilmCardSkeleton";
import { FloatingFilterButton } from "./FloatingFilterButton";
import { SaveButton } from "./SaveButton";
import { ModeToggle } from "@/components/ui/mode-toggle";
type VotePageProps = {
  className?: string;
  firstBlock?: { nodes: ReactNode[]; id: number }[];
  secondBlock?: { nodes: ReactNode[]; id: number }[];
} & HTMLAttributes<HTMLOrSVGElement>;

export const VotePage: FC<VotePageProps> = ({ firstBlock }) => {
  const client = useQueryClient();
  const [votedFilms, setVotedFilms] = useState<Set<number>>(new Set());
  const searchParams = useSearchParams();
  const voteId = searchParams.get("voteId");
  const { data, isLoading, isError, isFetching } = useQuery<VoteType>({
    queryKey: ["votedFilms", voteId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/vote/${voteId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      try {
        if (data && data.films && Array.isArray(JSON.parse(data.films))) {
          setVotedFilms(new Set(JSON.parse(data.films)));
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
        queryKey: ["votedFilms", voteId],
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

  const xor = (arr1: number[], arr2: number[]) => {
    return [
      ...arr1.filter((x) => !arr2.includes(x)),
      ...arr2.filter((x) => !arr1.includes(x)),
    ];
  };
  let changesAmount = votedFilms.size;
  if (data) {
    try {
      changesAmount = xor(
        Array.from(votedFilms),
        Array.from(JSON.parse(data.films))
      ).length;
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      {!isError && (
        <div className="flex flex-col w-full gap-20 p-10 items-center h-screen overflow-y-auto ">
          <h2>First block</h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 z-10">
            {firstBlock &&
              data &&
              firstBlock.map((item, index) => (
                <DragCarousel
                  key={index}
                  items={item.nodes}
                  state={votedFilms.has(item.id)}
                  onSelected={(state) => {
                    if (state) {
                      setVotedFilms((prev) => new Set(prev.add(item.id)));
                    } else {
                      setVotedFilms((prev) => {
                        prev.delete(item.id);
                        return new Set(prev);
                      });
                    }
                  }}
                />
              ))}
            {(!firstBlock || !data) && <FilmCardSkeletonGroup />}
          </div>
          <SaveButton
            isFetching={isFetching}
            isLoading={isLoading}
            isPending={isPending}
            onSubmit={onSubmit}
            changesAmount={changesAmount}
          />
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
