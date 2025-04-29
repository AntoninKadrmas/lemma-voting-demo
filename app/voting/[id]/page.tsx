import { FC, Suspense } from "react";
import { VotePage } from "./components/VotePage";
import { Toaster } from "@/components/ui/sonner";
import { FilmCardSkeletonGroup } from "./components/FilmCardSkeleton";
import { ApiCollections } from "@/types/api-collection";
import DirectusImage from "@/components/element/DirectusImage";
import { cn, parseTranslations } from "@/lib/utils";
import env from "@/env";
import { AvailableLocales } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: { id: string };
};

const Page: FC<Props> = async ({ params }) => {
  const lang: AvailableLocales = "cz-CZ";
  const { id } = await params;
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/films`, {
    method: "GET",
    cache: "no-store",
  });
  if (res.status != 200) return "Error during film fetching";
  const films: ApiCollections["film"][number][] = await res.json();
  const getFimComponent = (item: ApiCollections["film"][number]) => {
    item = parseTranslations<
      ApiCollections["film"][number] &
        ApiCollections["film_translations"][number]
    >(item, lang);
    return {
      nodes: [
        <div className="h-full w-full bg-background" key={item.id + "image"}>
          <div className={"h-[200px] w-[300px]"}>
            {item.title_image ? (
              <DirectusImage
                id={
                  typeof item.title_image === "string"
                    ? item.title_image
                    : item.title_image?.id
                }
                className={cn("h-full w-full object-cover pointer-events-none")}
                alt={"Background Image"}
              />
            ) : undefined}
          </div>
          <div className="flex flex-col p-2 pl-4">
            <h2 className="truncate text-ellipsis text-xl">{item.name}</h2>
            <p className="text-sm font-light">
              {item.genres &&
                (
                  item.genres as ApiCollections["film_film_genre"][number][]
                ).map(
                  (val: ApiCollections["film_film_genre"][number], index) => {
                    return (
                      <span key={val.id}>
                        {
                          parseTranslations<
                            ApiCollections["film_genre"][number]
                          >(
                            val.film_genre_id as ApiCollections["film_genre"][number],
                            lang
                          ).name
                        }
                        {index + 1 < (item.genres ?? []).length && ", "}
                      </span>
                    );
                  }
                )}
            </p>
          </div>
        </div>,
        <div
          className="h-full w-full overflow-auto bg-background p-5 px-8"
          key={item.id + "description"}
        >
          <p className="tex-md font-extrabold">{item.name}</p>
          <p className="text-sm font-light">{item.description}</p>
        </div>,
        <div
          className="h-full w-full overflow-auto bg-background p-5 px-8"
          key={item.id + "crew"}
        >
          <p className="tex-lg font-extrabold">Crew</p>
          <p className="ml-2">
            {(
              item.crew as ApiCollections["film_crew_film_person"][number][]
            ).map(
              (connection: ApiCollections["film_crew_film_person"][number]) => {
                const person =
                  connection.film_person_id as ApiCollections["film_person"][number];
                const roles = (
                  connection.crew_roles as ApiCollections["film_crew_film_person_film_crew_role"][number][]
                ).map((val) =>
                  parseTranslations<
                    ApiCollections["film_crew_role"][number] &
                      ApiCollections["film_crew_role_translations"][number]
                  >(
                    val.film_crew_role_id as ApiCollections["film_crew_role"][number],
                    lang
                  )
                );
                return (
                  <p key={person.id}>
                    <p className="text-sm font-bold">
                      {person?.first_name} {person?.middle_name}{" "}
                      {person?.last_name}{" "}
                    </p>
                    {roles.sort().map((role, index) => (
                      <span className="ml-2 text-sm font-light" key={role.id}>
                        <Badge>{role.name}</Badge>
                      </span>
                    ))}
                  </p>
                );
              }
            )}
          </p>
        </div>,
        <div
          className="h-full w-full overflow-auto bg-background p-5 px-8"
          key={item.id + "crew"}
        >
          <p className="tex-lg font-extrabold">Actors</p>
          <div className="ml-2">
            {(
              item.actors as ApiCollections["film_crew_film_person"][number][]
            ).map(
              (
                connection: ApiCollections["film_actor_film_person"][number]
              ) => {
                const person =
                  connection.film_person_id as ApiCollections["film_person"][number];
                return (
                  <div key={person.id}>
                    <p className="text-sm font-bold">
                      {person?.first_name} {person?.middle_name}{" "}
                      {person?.last_name}{" "}
                    </p>
                    <span className="ml-2 text-sm font-light">
                      <Badge>{connection.character}</Badge>
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>,
      ],
      id: item.id ?? 0,
      block:
        typeof item.festival_block === "number"
          ? item.festival_block
          : item.festival_block?.id ?? 0,
    };
  };
  return (
    <>
      <Toaster position="top-right" />
      {
        <Suspense fallback={<FilmCardSkeletonGroup />}>
          <VotePage
            voteId={id}
            movies={films ? films.map(getFimComponent) : undefined}
            lang={lang}
          />
        </Suspense>
      }
    </>
  );
};

export default Page;
