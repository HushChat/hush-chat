import { ApiResponse } from '@/types/common/types';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';

/**
 * A generic mutation hook that wraps React Query's useMutation with enhanced error handling,
 * automatic query invalidation, and standardized API response processing.
 *
 * This hook handles two types of responses:
 * - Success responses with data: Triggers query invalidation and success callbacks
 * - API error responses: Logs errors and triggers error callbacks (even when HTTP status is 200)
 * - Network/unexpected errors: Handles request failures and unexpected errors
 *
 * @template TData - The type of the successful response data
 * @template TVariables - The type of variables passed to the mutation function (defaults to void)
 *
 * @param mutationFn - The async function that performs the mutation and returns ApiResponse<TData>
 * @param options - Configuration options for the mutation
 * @param options.invalidateKeys - Array of query key arrays OR function that returns array of query key arrays to invalidate on successful mutation
 * @param options.onSuccess - Callback executed when mutation succeeds with data
 * @param options.onError - Callback executed when mutation fails (API error or network error)
 * @param options.mutationOptions - Additional React Query mutation options (excluding overridden ones)
 *
 * @returns A configured useMutation hook instance with enhanced error handling and query invalidation
 **/

export const useGenericMutation = <TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: {
    invalidateKeys?: string[][];
    invalidateKeyComputer?: (variables: TVariables, data?: TData) => string[][];
    onSuccess?: (data?: TData) => void;
    onError?: (error?: unknown) => void;
    mutationOptions?: Omit<
      UseMutationOptions<ApiResponse<TData>, unknown, TVariables>,
      'mutationFn' | 'onSuccess' | 'onError'
    >;
  },
) => {
  const queryClient = useQueryClient();

  // Helper to check if response indicates success and extract data
  const isSuccessResponse = (response: any): { isSuccess: boolean; data?: TData } => {
    if (response === undefined || response === null) {
      return { isSuccess: true }; // Void methods
    }
    if (('data' in response && response.data !== undefined) || !('error' in response)) {
      return { isSuccess: true, data: response.data };
    }
    return { isSuccess: false };
  };

  return useMutation({
    mutationFn,
    onSuccess: async (response, variables, context) => {
      const { isSuccess, data } = isSuccessResponse(response);

      if (isSuccess) {
        // Compute dynamic keys if computer provided
        let computedKeys: string[][] = [];
        if (options?.invalidateKeyComputer) {
          computedKeys = options.invalidateKeyComputer(variables, data);
        }

        // All keys to invalidate (static + computed)
        const allKeysToInvalidate = [...(options?.invalidateKeys || []), ...computedKeys];

        // Invalidate
        if (allKeysToInvalidate.length > 0) {
          await Promise.all(
            allKeysToInvalidate.map((key) => queryClient.invalidateQueries({ queryKey: key })),
          );
        }

        // Call user onSuccess
        if (data !== undefined) {
          options?.onSuccess?.(data);
        } else {
          options?.onSuccess?.();
        }
      } else {
        // Handle API errors (no invalidation)
        console.error('API error:', response.error);
        options?.onError?.(response.error);
      }
    },
    onError: (error) => {
      // Handle network/unexpected errors (no invalidation)
      console.error('Network/unexpected error:', error);
      options?.onError?.(error);
    },
    ...options?.mutationOptions,
  });
};
