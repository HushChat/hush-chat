/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { ApiResponse } from "@/types/common/types";
import { useGenericMutation } from "@/query/config/useGenericMutation";

// Overload for void methods (no return data)
export function createMutationHook<TVariables>(
  mutationFn: (variables: TVariables) => Promise<void>,
  invalidationKeyBuilder?: (
    keyParams: any,
  ) => (variables?: TVariables, data?: never) => string[][],
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
  invalidationKeyBuilder?: (
    keyParams: any,
  ) => (variables: TVariables, data?: TData) => string[][],
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
  invalidationKeyBuilder?: (
    keyParams: any,
  ) => (variables: TVariables, data?: TData) => string[][],
  defaultInvalidateKeys: string[][] = [],
) {
  return (
    keyParams?: any,
    onSuccess?: ((data?: TData) => void) | (() => void),
    onError?: (error?: unknown) => void,
    additionalInvalidateKeys?: string[][],
  ) => {
    const invalidateKeyComputer =
      invalidationKeyBuilder && keyParams
        ? invalidationKeyBuilder(keyParams)
        : undefined;

    return useGenericMutation(
      mutationFn as (variables: TVariables) => Promise<ApiResponse<TData>>,
      {
        invalidateKeys: [
          ...defaultInvalidateKeys,
          ...(additionalInvalidateKeys || []),
        ],
        invalidateKeyComputer,
        onSuccess: onSuccess as (data?: TData) => void,
        onError,
      },
    );
  };
}
