"use client";
import { ReactNode, Suspense } from "react";
import { apiUrl, VotePage } from "./components/VotePage";
import { FilmType } from "./components/FilmType";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { FilmCardSkeletonGroup } from "./components/FilmCardSkeleton";

const Page = () => {
  const { data } = useQuery({
    queryKey: ["allFilms"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/films`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
      });
      return await response.json();
    },
  });
  const getFimComponent = (
    item: FilmType
  ): { nodes: ReactNode[]; id: number } => {
    return {
      nodes: [
        <div className="h-full w-full bg-background" key={item.id + item.name}>
          <div className={"h-[200px] w-[300px]"}>
            <img
              src={
                "https://cdn.muni.cz/media/3319959/homepage-header.jpg?upscale=false&width=1200"
              }
              alt={item.name}
              className="pointer-events-none h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col p-2">
            <h2 className="truncate text-ellipsis text-xl">{item.name}</h2>
            <p className="text-sm font-light">{item.genre}</p>
          </div>
        </div>,
        <div
          className="h-full w-full overflow-auto bg-background p-5"
          key={item.id + item.description}
        >
          <p className="text-md">{item.name}</p>
          <p className="text-sm">{item.description}</p>
        </div>,
      ],
      id: item.id,
    };
  };

  return (
    <div className="w-full">
      <div className="flex h-auto py-28 w-fit m-auto items-center justify-center">
        <h1>VOTING</h1>
      </div>
      <Toaster />
      {
        <Suspense
          fallback={
            <div className="flex flex-col w-full gap-20 p-10 items-center ">
              <h2>First block</h2>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 ">
                <FilmCardSkeletonGroup />
              </div>
            </div>
          }
        >
          <VotePage firstBlock={data ? data.map(getFimComponent) : null} />
        </Suspense>
      }
    </div>
  );
};

export default Page;
