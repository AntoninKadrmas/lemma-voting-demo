"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import {
  useEffect,
  useState,
  type FC,
  type HTMLAttributes,
  type PropsWithChildren,
} from "react";

type ProviderProps = PropsWithChildren<{
  className?: string;
}> &
  HTMLAttributes<HTMLOrSVGElement>;

const InnerProviders: FC<ProviderProps> = ({ children, ...props }) => {
  const [queryClient] = useState(() => new QueryClient());
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("credentials", {
        anonymous: "true",
        redirect: false,
      });
    }
  }, [status]);

  return (
    <div {...props}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
};

export const Providers: FC<ProviderProps> = ({ children, ...props }) => {
  return (
    <SessionProvider>
      <InnerProviders {...props}>{children}</InnerProviders>
    </SessionProvider>
  );
};
