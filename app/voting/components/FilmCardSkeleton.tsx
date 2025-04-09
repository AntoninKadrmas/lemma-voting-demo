import { Skeleton } from "@/components/ui/skeleton";
import { FC, HTMLAttributes } from "react";

type FilmCardSkeletonProps = {
  className?: string;
} & HTMLAttributes<HTMLOrSVGElement>;

export const FilmCardSkeleton: FC<FilmCardSkeletonProps> = ({ ...props }) => {
  return (
    <Skeleton className="group relative mx-auto h-[270px] w-[300px] max-w-lg" />
  );
};

export const FilmCardSkeletonGroup: FC<FilmCardSkeletonProps> = ({
  ...props
}) => {
  return (
    <>
      {[0, 0, 0, 0, 0, 0].map((_) => {
        return <FilmCardSkeleton />;
      })}
    </>
  );
};
