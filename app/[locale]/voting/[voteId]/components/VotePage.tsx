"use client";
import {
  FC,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoToggle } from "@/components/ui/info-toggle";
import { FilmShortContent } from "@/app/[locale]/admin/components/FilmShortContent";
export type Movies = {
  nodes: ReactNode[];
  id: number;
  block: ApiCollections["festival_block"][number];
};

type VotePageProps = {
  className?: string;
  voteId?: string;
  movies?: Movies[];
  films: ApiCollections["film"][number][];
  lang: AvailableLocales;
} & HTMLAttributes<HTMLOrSVGElement>;

export const VotePage: FC<VotePageProps> = ({
  movies,
  voteId,
  lang,
  films,
}) => {
  const client = useQueryClient();
  const [votedFilms, setVotedFilms] = useState<Set<number> | null>(null);
  const [counter, setCounter] = useState(-1);
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
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Unknown server error");
      }
      const data: ApiCollections["vote"][number] = await response.json();
      try {
        if (data && !votedFilms) {
          setVotedFilms(new Set(JSON.parse(data.films ?? "[]")));
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
          return -1;
        });
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [counter]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (films: Set<number>) => {
      setCounter(-1);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/vote/${voteId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            films: Array.from(films),
            timestamp: new Date().toISOString(),
          }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Unknown server error");
      }
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
    onError: (error) => {
      toast.error("Error", {
        className: "dark:text-white",
        description: error.toString()
          ? error.toString()
          : lang == "en-US"
          ? "There was an error submitting your vote."
          : "Došlo k chybě při odesílání vašeho hlasu.",
        action: {
          label: lang == "en-US" ? "Try again" : "Zkusit znovu",
          onClick: onSubmit,
        },
      });
      setCounter(30);
    },
  });

  const onSubmit = useCallback(
    debounce(() => {
      setCounter(-1);
      mutate(votedFilms ?? new Set());
    }, 200),
    [votedFilms, mutate]
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
        moment().add(1, "minute").isAfter(moment(voting.end_date))) &&
      moment().isBefore(moment(voting.end_date))
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

  const userVotedId = useMemo(() => {
    try {
      return new Set<number>(JSON.parse(data?.films ?? "[]"));
    } catch {
      return new Set<number>();
    }
  }, [data?.films]);

  useEffect(() => {
    if (votedFilms && !areSetsEqual(votedFilms, userVotedId)) {
      setCounter(30);
    } else {
      setCounter(-1);
    }
  }, [votedFilms, userVotedId]);

  useEffect(() => {
    if (counter == 0) {
      mutate(votedFilms ?? new Set());
    }
  }, [counter, mutate, votedFilms]);

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
      <div className="flex flex-col w-full gap-5 p-10 py-16 items-center h-screen overflow-y-auto ">
        <h4 className={"pb-6 text-xl font-bold sm:text-3xl"}>
          {voting.after_end_text}
        </h4>
        <p>{lang == "en-US" ? "Selected films:" : "Zvolené filmy:"}</p>
        {JSON.parse(data?.films ?? "[]").map((filmId: number) => {
          return (
            <FilmShortContent
              key={filmId}
              lang={lang}
              className=""
              film={films.find((x) => x.id == filmId)!}
            />
          );
        })}
      </div>
    );
  }

  if (voting) {
    setTimeout(() => {
      client.invalidateQueries({
        queryKey: ["votedFilms", voteId],
        exact: true,
      });
      setCounter(-1);
    }, moment(voting.end_date).diff(moment()));
  }

  const votingFilmsIds: Set<number> = new Set(
    ((voting?.films ?? []) as ApiCollections["voting_film"][number][]).map(
      (item: ApiCollections["voting_film"][number]) => item.film_id as number
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
        <div className="flex flex-col w-full gap-20 p-10 py-16 items-center h-screen overflow-y-auto ">
          {Array.from(orderedByBlockMovies.keys()).map((item) => {
            return (
              <BlockPage
                key={item}
                block={JSON.parse(item)}
                lang={lang}
                filteredMovies={orderedByBlockMovies.get(item)}
                votedFilms={votedFilms ?? new Set()}
                setVotedFilms={(id: number) => {
                  if (!(votedFilms ?? new Set()).has(id)) {
                    setVotedFilms(
                      (prev) => new Set((prev ?? new Set()).add(id))
                    );
                  } else {
                    setVotedFilms((prev) => {
                      (prev ?? new Set()).delete(id);
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
              actualAmount={(votedFilms ?? new Set()).size}
              counter={counter}
              changed={!areSetsEqual(votedFilms ?? new Set(), userVotedId)}
              voteMessage={voting?.submit_text ?? "SAVE/ULOŽIT"}
            />
          )}
          <FloatingFilterButton />
          {voting && (
            <TimeToggle
              endTime={voting?.end_date ?? ""}
              onClick={() => {
                showRemainingTime();
              }}
            />
          )}
          {films && voting && (
            <Dialog>
              <DialogTrigger asChild>
                <InfoToggle onClick={() => {}} />
              </DialogTrigger>
              <DialogContent className="w-screen max-w-screen max-h-screen sm:w-[calc(100%-5rem)] sm:max-w-[800px]! h-screen sm:max-h-[80%] sm:h-fit overflow-y-auto flex flex-col overflow-x-hidden gap-3 p-2 sm:p-4">
                <DialogHeader>
                  <DialogTitle>
                    {lang == "en-US" ? "Vote info" : "Informace o hlasu"}
                  </DialogTitle>
                </DialogHeader>
                <p>
                  {lang == "en-US"
                    ? "Last time voted:"
                    : "Naposledy zahlasováno:"}
                  {data?.timestamp
                    ? moment(data?.timestamp).format(" DD. MM. YYYY, h:mm:ss ")
                    : lang == "en-US"
                    ? "Not voted yet."
                    : "Ještě nehlasováno."}
                </p>
                <p>
                  {lang == "en-US"
                    ? "Voted for films:"
                    : "Hlasováno pro filmy:"}
                </p>
                {JSON.parse(data?.films ?? "[]").map((filmId: number) => {
                  return (
                    <FilmShortContent
                      key={filmId}
                      lang={lang}
                      className=""
                      film={films.find((x) => x.id == filmId)!}
                    />
                  );
                })}
                {JSON.parse(data?.films ?? "[]").length == 0 && (
                  <p className="text-sm">
                    {lang == "en-US"
                      ? "No films selected."
                      : "Není vybraný žádný film."}
                  </p>
                )}
              </DialogContent>
            </Dialog>
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
