"use client";
import {
  FC,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce, set } from "lodash";
import { toast } from "sonner";
import { FloatingFilterButton } from "./FloatingFilterButton";
import { SaveButton, SaveButtonFallback } from "./SaveButton";
import { ApiCollections } from "@/types/api-collection";
import env from "@/env";
import { areSetsEqual, parseTranslations } from "@/lib/utils";
import { AvailableLocales } from "@/lib/constants";
import { BlockPage } from "./BlockPage";
import { FilmCardSkeletonGroup } from "./FilmCardSkeleton";
import moment from "moment";
import Countdown from "@/components/element/Countdown";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LastVoteIdButton } from "../../components/LastVoteIdButton";
import { TimeToggle } from "@/components/ui/time-toggle";
import { LuClock } from "react-icons/lu";
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
  const [counter, setCounter] = useState(0);
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

  useEffect(() => {
    if (counter > 0) {
      const interval = setInterval(() => {
        setCounter(function (value) {
          if (value > 0) {
            return value - 1;
          }
          return 0;
        });
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [counter]);

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
      toast.success("Success", {
        className: "dark:text-white",
        description:
          lang == "en-US"
            ? "Your vote has been submitted successfully."
            : "Váš hlas byl úspěšně odeslán.",
      });
      client.invalidateQueries({
        queryKey: ["votedFilms", voteId],
        exact: true,
      });
    },
    onError: () => {
      toast.error("Error", {
        className: "dark:text-white",
        description:
          lang == "en-US"
            ? "There was an error submitting your vote."
            : "Došlo k chybě při odesílání vašeho hlasu.",
        action: {
          label: lang == "en-US" ? "Try again" : "Zkusit znovu",
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

  if (voting) {
    localStorage.setItem("voteId", voteId!);
  }

  const showRemainingTime = useCallback(() => {
    toast.info(
      <Countdown
        end_date={voting.end_date}
        title={
          lang == "en-US" ? "Time till voting end." : "Čas do konce hlasování"
        }
        compact
      />,
      {
        duration: Infinity,
        id: "unique-toast",
        closeButton: true,
        onDismiss: () => {
          localStorage.setItem("dismissed", "true");
        },
      }
    );
  }, [voting, lang]);

  useEffect(() => {
    if (
      voting &&
      (!localStorage.getItem("dismissed") ||
        (moment().add(1, "minute").isAfter(moment(voting.end_date)) &&
          moment().isBefore(moment(voting.end_date))))
    ) {
      showRemainingTime();
    }
    let timeout: NodeJS.Timeout;
    if (voting && moment().isBefore(moment(voting.end_date))) {
      timeout = setTimeout(() => {
        showRemainingTime();
      }, moment(voting.end_date).diff(moment().add(1, "minute")));
    }
    return () => clearTimeout(timeout);
  }, [voting, showRemainingTime]);

  const userVotedId = new Set(
    ((data?.films ?? []) as ApiCollections["vote_film"][number][]).map(
      (item: ApiCollections["vote_film"][number]) => item.film_id as number
    )
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (votedFilms && !areSetsEqual(votedFilms, userVotedId)) {
      setCounter(30);
      timeout = setTimeout(() => {
        mutate(votedFilms);
      }, 33 * 1000);
    }
    return () => clearTimeout(timeout);
  }, [votedFilms, mutate]);

  if (voting && moment(voting.start_date).isAfter(moment())) {
    setTimeout(() => {
      client.invalidateQueries({
        queryKey: ["votedFilms", voteId],
        exact: true,
      });
    }, moment(voting.start_date).diff(moment()));
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full text-center">
        <Countdown
          end_date={voting.start_date}
          title={voting.before_start_text}
          lang={lang}
        />
      </div>
    );
  }
  if (voting && moment(voting.end_date).isBefore(moment())) {
    toast.dismiss();
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full text-center">
        <h4 className={"pb-6 text-xl font-bold sm:text-3xl"}>
          {voting.after_end_text}
        </h4>
      </div>
    );
  }

  if (voting) {
    setTimeout(() => {
      client.invalidateQueries({
        queryKey: ["votedFilms", voteId],
        exact: true,
      });
    }, moment(voting.end_date).diff(moment()));
  }

  const votingFilmsIds: Set<number> = new Set(
    ((voting?.films ?? []) as ApiCollections["vote_film"][number][]).map(
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
      {!isError && !data && <FilmCardSkeletonGroup />}
      {!isError && !data && <FilmCardSkeletonGroup />}
      {!isError && !voting && <SaveButtonFallback />}
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
          {!!voting && (
            <SaveButton
              isFetching={isFetching}
              isLoading={isLoading}
              isPending={isPending}
              onSubmit={onSubmit}
              maxAmount={votingFilmsIds?.size ?? 0}
              actualAmount={votedFilms.size}
              counter={counter}
              changed={!areSetsEqual(votedFilms, userVotedId)}
              voteMessage={voting?.submit_text ?? "SAVE/ULOŽIT"}
            />
          )}
          <FloatingFilterButton />
          {voting && (
            <TimeToggle
              endTime={voting?.end_date ?? ""}
              className={"left-[7rem] top-3 sm:left-[8rem] sm:top-8"}
              icon={<LuClock />}
              onClick={() => {
                showRemainingTime();
              }}
            />
          )}
        </div>
      )}
      {isError && (
        <div className="w-screen h-screen justify-center items-center flex text-center flex-col gap-2">
          {lang == "en-US" && (
            <>
              <p className="flex justify-center items-center p-2 text-2xl">
                This voteId does not exists.
              </p>
              <LastVoteIdButton lang={lang} />
              <p className="flex justify-center items-center p-2 text-2xl">
                Try to scan it again or ask for a new one. With this screen
                message.
              </p>
              <Link
                href={"/en/voting"}
                className={buttonVariants({ variant: "outline" })}
              >
                Return home
              </Link>
            </>
          )}
          {lang == "cz-CZ" && (
            <>
              <p className="flex justify-center items-center p-2 text-2xl">
                Toto voteId neexistuje.
              </p>
              <LastVoteIdButton lang={lang} />
              <p className="flex justify-center items-center p-2 text-2xl">
                Zkuste ho naskenovat znova nebo si zažádejte o nový s touto
                obrazovkou.
              </p>
              <Link
                href={"/cz/voting"}
                className={buttonVariants({ variant: "outline" })}
              >
                Návrat domů
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
};
