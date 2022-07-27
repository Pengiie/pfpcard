// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import type { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { trpc, trpcClient, trpcClientConfig, trpcQueryClientConfig } from "../utils/trpc";
import { QueryClient, QueryClientProvider } from "react-query";

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
};

export const queryClient = new QueryClient(trpcQueryClientConfig)

export default withTRPC<AppRouter>({
  config: () => trpcClientConfig
})(MyApp);
