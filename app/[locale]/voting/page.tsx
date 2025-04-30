import { FC, Suspense } from "react";
import { Movies, VotePage } from "./components/VotePage";
import { FilmCardSkeletonGroup } from "./components/FilmCardSkeleton";
import { ApiCollections } from "@/types/api-collection";
import DirectusImage from "@/components/element/DirectusImage";
import { cn, parseTranslations } from "@/lib/utils";
import env from "@/env";
import { AVAIL_LOCALES, AvailableLocales } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import directusImageLoader from "@/lib/DirectusLoader";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Page: FC<Props> = async ({ params, searchParams }) => {
  const { locale } = await params;
  const { voteId } = await searchParams;
  const lang = (AVAIL_LOCALES.find((x) => x.startsWith(locale ?? "")) ??
    "cz-CZ") as AvailableLocales;
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/films`, {
    method: "GET",
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
            ) : (
              <Image
                src={`${env.NEXT_PUBLIC_DIRECTUS_URL}assets/4f0da649-2fe3-45a5-902b-68783f04b16b`}
                loader={directusImageLoader}
                alt="Fallback Image"
                width={400}
                height={400}
                className={cn("h-full w-full object-cover pointer-events-none")}
              />
            )}
          </div>
          <div className="flex flex-col p-2 pl-3">
            <h2 className="truncate text-ellipsis text-xl">{item.name}</h2>
            <div className="text-sm font-light flex gap-1">
              {item.genres &&
                (
                  item.genres as ApiCollections["film_film_genre"][number][]
                ).map((val: ApiCollections["film_film_genre"][number]) => {
                  return (
                    <Badge key={val.id + "badge_genre"}>
                      {
                        parseTranslations<ApiCollections["film_genre"][number]>(
                          val.film_genre_id as ApiCollections["film_genre"][number],
                          lang
                        ).name
                      }
                    </Badge>
                  );
                })}
            </div>
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
          <div className="ml-2 flex-col flex gap-1">
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
                  <div key={person.id + "crew"}>
                    <p className="text-sm font-bold">
                      {person?.first_name} {person?.middle_name}{" "}
                      {person?.last_name}{" "}
                    </p>
                    <div className="ml-2 flex gap-1 flex-wrap w-full">
                      {roles.sort().map((role) => (
                        <Badge key={role.id + "crew_role"}>{role.name}</Badge>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>,
        <div
          className="h-full w-full overflow-auto bg-background p-5 px-8"
          key={item.id + "crew"}
        >
          <p className="tex-lg font-extrabold">Actors</p>
          <div className="ml-2 flex-col flex gap-1">
            {(
              item.actors as ApiCollections["film_crew_film_person"][number][]
            ).map(
              (
                connection: ApiCollections["film_actor_film_person"][number]
              ) => {
                const person =
                  connection.film_person_id as ApiCollections["film_person"][number];
                return (
                  <div key={person.id + "actor"}>
                    <p className="text-sm font-bold">
                      {person?.first_name} {person?.middle_name}{" "}
                      {person?.last_name}
                    </p>
                    {connection.character && (
                      <div className="ml-2 flex gap-1 flex-wrap w-full">
                        <Badge>{connection.character}</Badge>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>,
      ],
      id: item.id ?? 0,
      block: item.festival_block as ApiCollections["festival_block"][number],
    };
  };
  return (
    <>
      {
        <Suspense fallback={<FilmCardSkeletonGroup />}>
          <VotePage
            voteId={voteId as string}
            movies={
              films ? (films.map(getFimComponent) as Movies[]) : undefined
            }
            lang={lang}
          />
        </Suspense>
      }
    </>
  );
};

export default Page;
