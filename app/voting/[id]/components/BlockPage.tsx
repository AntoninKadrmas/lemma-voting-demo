import { FC, HTMLAttributes } from "react";
import DragCarousel from "./FilmCard";
import { Movies } from "./VotePage";
import { ApiCollections } from "@/types/api-collection";
import { parseTranslations } from "@/lib/utils";
import { AvailableLocales } from "@/lib/constants";

type BlockPageProps = {
  className?: string;
  filteredMovies?: Movies[];
  block: ApiCollections["festival_block"][number];
  votedFilms: Set<number>;
  lang: AvailableLocales;
  setVotedFilms: (vote: number) => void;
} & HTMLAttributes<HTMLOrSVGElement>;

export const BlockPage: FC<BlockPageProps> = ({
  filteredMovies,
  votedFilms,
  block,
  lang,
  setVotedFilms,
}) => {
  block = parseTranslations<
    ApiCollections["festival_block"][number] &
      ApiCollections["festival_block_translations"][number]
  >(block, lang);
  return (
    <>
      <h2>{block.name}</h2>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 z-10">
        {filteredMovies &&
          filteredMovies.map((item) => (
            <DragCarousel
              key={item.id+"block"}
              items={item.nodes}
              state={votedFilms.has(item.id)}
              onSelected={() => setVotedFilms(item.id)}
            />
          ))}
      </div>
    </>
  );
};
