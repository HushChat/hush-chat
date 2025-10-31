import { QueryClient } from "@tanstack/react-query";

let client: QueryClient | null = null;

export const createQueryClient = () => {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 2,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
        },
        mutations: { retry: false },
      },
    });
  }
  return client;
};

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export const DAILY_CACHE_OPTIONS = {
  staleTime: ONE_DAY_IN_MS, // Data will be considered fresh for 1 day
  cacheTime: ONE_DAY_IN_MS * 2, // Data will be cached for 1 day
};

export const HOURLY_CACHE_OPTIONS = {
  staleTime: ONE_HOUR_IN_MS,
  cacheTime: ONE_HOUR_IN_MS * 2,
};
