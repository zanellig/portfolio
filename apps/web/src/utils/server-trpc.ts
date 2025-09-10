import "server-only";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

import {
  createTRPCContext,
  createTRPCOptionsProxy,
} from "@trpc/tanstack-react-query";

import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from "@trpc/client";

import { appRouter, type AppRouter } from "../../../server/src/routers";
import { cache } from "react";
import { t } from "../../../server/src/lib/trpc";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        // deserializeData: superjson.deserialize,
      },
    },
  });
}

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
      false: httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    }),
  ],
});

export const getQueryClient = cache(makeQueryClient);
export const caller = appRouter.createCaller(createTRPCContext);

export const trpc = createTRPCOptionsProxy({
  client: trpcClient,
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});
