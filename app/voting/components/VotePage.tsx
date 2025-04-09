"use client";
import {
  FC,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import DragCarousel from "./FilmCard";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { LuLoader } from "react-icons/lu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VoteType } from "./FilmType";
import { FilmCardSkeletonGroup } from "./FilmCardSkeleton";
type VotePageProps = {
  className?: string;
  firstBlock?: { nodes: ReactNode[]; id: number }[];
  secondBlock?: { nodes: ReactNode[]; id: number }[];
} & HTMLAttributes<HTMLOrSVGElement>;

export const apiUrl = false
  ? "http://localhost:3001/api"
  : "https://lemma-voting-demo.vercel.app/api";

export const VotePage: FC<VotePageProps> = ({ firstBlock }) => {
  const client = useQueryClient();
  const [votedFilms, setVotedFilms] = useState<Set<number>>(new Set());
  const searchParams = useSearchParams();
  const voteId = searchParams.get("voteId");
  const { data, isLoading, isError } = useQuery<VoteType>({
    queryKey: ["votedFilms", voteId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/vote/${voteId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: async (films: Set<number>) => {
      const response = await fetch(`${apiUrl}/vote/${voteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          films: JSON.stringify(Array.from(films)),
          timestamp: new Date().toISOString(),
        }),
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Your work has been submitted", {
        className: "text-white",
        description: "Your vote has been submitted successfully.",
      });
      client.invalidateQueries({ queryKey: ["votedFilms", voteId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error", {
        className: "text-white",
        description: "There was an error submitting your vote." + error.message,
        action: {
          label: "Try again",
          onClick: onSubmit,
        },
      });
    },
  });

  const onSubmit = useCallback(
    debounce(() => {
      mutate(votedFilms);
    }, 300),
    [votedFilms]
  );

  useEffect(() => {
    if (data && Array.isArray(JSON.parse(data.films))) {
      setVotedFilms(new Set(JSON.parse(data.films)));
    }
  }, [data]);
  return (
    <>
      {!isError && (
        <div className="flex flex-col w-full gap-20 p-10 items-center">
          <h2>First block</h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 ">
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
          <Button
            onClick={onSubmit}
            disabled={isPending}
            className={
              isPending || isLoading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }
          >
            <div className="flex gap-2">
              {isPending && <LuLoader className="animate-spin" />}
              <span>Submit Vote</span>
            </div>
          </Button>
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
