import { useQueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Reusable helper to update a field in any cached object.
 *
 */
export function useUpdateCache() {
  const queryClient = useQueryClient();

  return function updateCache<T>(
    queryKey: QueryKey,
    updater: (oldData: T | undefined) => T | undefined,
  ) {
    queryClient.setQueryData<T>(queryKey, updater);
  };
}
