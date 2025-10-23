import { ApiResponse } from '@/types/common/types';
import { useGenericMutation } from '@/query/config/useGenericMutation';

// Overload for void methods (no return data)
export function createMutationHook<TVariables>(
  mutationFn: (variables: TVariables) => Promise<void>,
  invalidationKeyBuilder?: (keyParams: any) => (variables?: TVariables, data?: never) => string[][],
  defaultInvalidateKeys?: string[][],
): (
  keyParams?: any,
  onSuccess?: () => void,
  onError?: (error?: unknown) => void,
  additionalInvalidateKeys?: string[][],
) => ReturnType<typeof useGenericMutation>;

// Overload for methods that return data
export function createMutationHook<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  invalidationKeyBuilder?: (keyParams: any) => (variables: TVariables, data?: TData) => string[][],
  defaultInvalidateKeys?: string[][],
): (
  keyParams?: any,
  onSuccess?: (data: TData) => void,
  onError?: (error?: unknown) => void,
  additionalInvalidateKeys?: string[][],
) => ReturnType<typeof useGenericMutation>;

// Implementation
export function createMutationHook<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData> | void>,
  invalidationKeyBuilder?: (keyParams: any) => (variables: TVariables, data?: TData) => string[][],
  defaultInvalidateKeys: string[][] = [],
) {
  return (
    keyParams?: any,
    onSuccess?: ((data?: TData) => void) | (() => void),
    onError?: (error?: unknown) => void,
    additionalInvalidateKeys?: string[][],
  ) => {
    const invalidateKeyComputer =
      invalidationKeyBuilder && keyParams ? invalidationKeyBuilder(keyParams) : undefined;

    return useGenericMutation(
      mutationFn as (variables: TVariables) => Promise<ApiResponse<TData>>,
      {
        invalidateKeys: [...defaultInvalidateKeys, ...(additionalInvalidateKeys || [])],
        invalidateKeyComputer,
        onSuccess: onSuccess as (data?: TData) => void,
        onError,
      },
    );
  };
}
