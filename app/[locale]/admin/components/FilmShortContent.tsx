import { Badge } from "@/components/ui/badge";
import env from "@/env";
import { AvailableLocales } from "@/lib/constants";
import directusImageLoader from "@/lib/DirectusLoader";
import { cn, parseTranslations } from "@/lib/utils";
import { ApiCollections } from "@/types/api-collection";
import Image from "next/image";
import { FC, HTMLAttributes } from "react";

type FilmShortContentProps = {
  className?: string;
  film: ApiCollections["film"][number];
  lang: AvailableLocales;
  amount?: number;
} & HTMLAttributes<HTMLOrSVGElement>;

export const FilmShortContent: FC<FilmShortContentProps> = ({
  film,
  className,
  lang,
  amount,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        className,
        "flex w-full justify-between items-center border"
      )}
    >
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-grow min-w-0">
        <div className="h-[100px] w-[200px] sm:h-[100px] shrink-0">
          <Image
            src={`${env.NEXT_PUBLIC_DIRECTUS_URL}assets/${
              film.title_image
                ? typeof film.title_image === "string"
                  ? film.title_image
                  : film.title_image?.id
                : "4f0da649-2fe3-45a5-902b-68783f04b16b"
            }`}
            loader={directusImageLoader}
            alt="Fallback Image"
            width={100}
            height={100}
            className="h-full w-full object-cover pointer-events-none"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col flex-grow min-w-0">
          <h2 className="truncate text-ellipsis text-xl whitespace-nowrap">
            {film.name}
          </h2>
          <div className="text-sm font-light flex gap-1 flex-wrap">
            {film.genres &&
              (film.genres as ApiCollections["film_film_genre"][number][]).map(
                (val: ApiCollections["film_film_genre"][number]) => (
                  <Badge key={val.id + "badge_genre_short"}>
                    {
                      parseTranslations<ApiCollections["film_genre"][number]>(
                        val.film_genre_id as ApiCollections["film_genre"][number],
                        lang
                      ).name
                    }
                  </Badge>
                )
              )}
          </div>
        </div>
      </div>

      {amount && (
        <span className="text-4xl font-bold shrink-0 pl-2">{amount}</span>
      )}
    </div>
  );
};
