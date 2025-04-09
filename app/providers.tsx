"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useState,
  type FC,
  type HTMLAttributes,
  type PropsWithChildren,
} from "react";

type ProviderProps = PropsWithChildren<{
  className?: string;
}> &
  HTMLAttributes<HTMLOrSVGElement>;

export const Providers: FC<ProviderProps> = ({ ...props }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <div {...props}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </div>
  );
};
