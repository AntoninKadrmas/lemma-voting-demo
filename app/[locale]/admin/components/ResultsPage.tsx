"use client";
import { useQuery } from "@tanstack/react-query";
import RenderResult from "next/dist/server/render-result";
import { env } from "process";
import { FC, HTMLAttributes } from "react";

type ResultsPageProps = {
  className?: string;
} & HTMLAttributes<HTMLOrSVGElement>;

export const ResultsPage: FC<ResultsPageProps> = ({ ...props }) => {
  const { data, isLoading, isError, isFetching } = useQuery<any>({
    queryKey: ["votedFilms"],
    queryFn: async () => {
      const response = await fetch(`${env.NEXT_PUBLIC_API_URL || ""}/vote`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Unknown server error");
      }
      const data: any = await response.json();
      return data;
    },
  });
  console.log(data);
  return <div {...props}></div>;
};
