import "server-only";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

import { createTRPCContext } from "@trpc/tanstack-react-query";

import { appRouter } from "../../../server/src/routers";
import { cache } from "react";

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

export const getQueryClient = cache(makeQueryClient);
export const caller = appRouter.createCaller(createTRPCContext);
