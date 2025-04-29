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
    <div className="flex flex-col w-full gap-20 p-10 items-center ">
      <h2>First block</h2>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 ">
        {Array(10)
          .fill(0)
          .map((data, index) => {
            return <FilmCardSkeleton key={data + index} />;
          })}
      </div>
    </div>
  );
};
