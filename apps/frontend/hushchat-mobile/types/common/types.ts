export interface PaginatedResponse<T> {
  content: T[];
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedQueryResult {
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  invalidateQuery?: () => void;
  refetch: () => Promise<unknown>;
}
