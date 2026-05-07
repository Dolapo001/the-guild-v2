"use client";

import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

/**
 * One QueryClient per browser tab. On the server we always make a new client
 * (per the TanStack Query SSR guide); on the client we lazily memoize a single
 * instance via useState so HMR doesn't reset the cache.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30s: enough to survive route changes without
                              // refetching, short enough that the UI catches
                              // up to the backend within reasonable bounds.
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
          // Don't retry auth failures — the api-client refresh flow handles that.
          if (error?.status === 401 || error?.status === 403) return false;
          if (error?.status === 404) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => getQueryClient());
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </QueryClientProvider>
  );
}
