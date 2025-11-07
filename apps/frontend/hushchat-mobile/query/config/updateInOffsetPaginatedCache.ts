import { QueryClient, QueryKey } from "@tanstack/react-query";

type PageWithItems<T> = { items: T[]; [k: string]: any };
type OffsetResult<T> = {
  pages: PageWithItems<T>[];
  pageParams?: any[];
  [k: string]: any;
};

type UpdateOptions<T> = {
  /** Required: unique id for finding the item */
  getId: (item: T) => string | number;
  /** Accessors for your page shape (defaults try content → items) */
  getPageItems?: (page: any) => T[];
  setPageItems?: (page: any, items: T[]) => any;
};

/**
 * updateInOffsetPaginatedCache
 *
 * Updates an existing item in offset-paginated React Query cache by ID.
 * Only updates fields that exist in the provided data (partial update).
 *
 * @param queryClient - React Query client instance
 * @param queryKey - Query key for the cache to update
 * @param id - ID of the item to update
 * @param updates - Partial data to merge with existing item
 * @param opts - Configuration options
 */
export function updateInOffsetPaginatedCache<T extends Record<string, any>>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string | number,
  updates: Partial<T>,
  opts: UpdateOptions<T>
) {
  const {
    getId,
    getPageItems = (p: any) => (p?.content ?? p?.items ?? []) as T[],
    setPageItems = (p: any, items: T[]) =>
      "content" in (p ?? {}) ? { ...p, content: items } : { ...p, items },
  } = opts;

  queryClient.setQueryData<OffsetResult<T>>(queryKey, (data) => {
    if (!data?.pages?.length) return data;

    const pages = data.pages.map((page) => {
      const items = getPageItems(page);
      const itemIndex = items.findIndex((item) => getId(item) === id);

      // If item not found in this page, return page unchanged
      if (itemIndex === -1) return page;

      // Found the item - merge updates with existing data
      const updatedItems = [...items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        ...updates,
      };

      return setPageItems(page, updatedItems);
    });

    return {
      ...data,
      pages,
    };
  });
}
