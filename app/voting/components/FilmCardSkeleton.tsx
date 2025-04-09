import { Skeleton } from "@/components/ui/skeleton";
import { FC, HTMLAttributes } from "react";

type FilmCardSkeletonProps = {
  className?: string;
} & HTMLAttributes<HTMLOrSVGElement>;

export const FilmCardSkeleton: FC<FilmCardSkeletonProps> = ({}) => {
  return (
    <Skeleton className="group relative mx-auto h-[270px] w-[300px] max-w-lg" />
  );
};

export const FilmCardSkeletonGroup: FC<FilmCardSkeletonProps> = ({}) => {
  return (
    <>
      {Array(10)
        .fill(0)
        .map((data, index) => {
          return <FilmCardSkeleton key={data + index} />;
        })}
    </>
  );
};
