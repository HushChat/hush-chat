import { QueryClient, QueryKey } from "@tanstack/react-query";

type PageWithItems<T> = { items: T[]; [k: string]: any };
type OffsetResult<T> = {
  pages: PageWithItems<T>[];
  pageParams?: any[];
  [k: string]: any;
};

type AppendOptions<T> = {
  /** Required: unique id for de-dupe */
  getId: (item: T) => string | number;
  /** Page size (server page size). Required for reflow. */
  pageSize: number;
  /** Accessors for your page shape (defaults try content → items) */
  getPageItems?: (page: any) => T[];
  setPageItems?: (page: any, items: T[]) => any;
  /** Optional: when true, if same id exists anywhere, remove it before inserting */
  createIfEmpty?: boolean;
  /** Optional: if true, moves updated items (with same id) to the top of page 0 (default: false) */
  moveUpdatedToTop?: boolean;
  /** Optional: function to determine if an item should be pinned to the top (default: () => false) */
  isPinned?: (item: T) => boolean;
};

/** Normalize paging metadata & pageParams offsets */
function normalizeMetadata<T extends Record<string, any>>(
  pages: T[],
  pageSize: number,
  prev?: any
) {
  const totalElements = pages.reduce((sum, p) => {
    const len = Array.isArray(p.content)
      ? p.content.length
      : Array.isArray(p.items)
        ? p.items.length
        : 0;
    return sum + len;
  }, 0);
  const totalPages = pages.length;

  const normalized = pages.map((p, i) => ({
    ...p,
    number: i,
    first: i === 0,
    last: i === totalPages - 1,
    size: pageSize,
    numberOfElements: Array.isArray((p as any).content)
      ? (p as any).content.length
      : Array.isArray((p as any).items)
        ? (p as any).items.length
        : 0,
    totalPages,
    totalElements,
    pageable: {
      ...(p as any).pageable,
      size: pageSize,
      paged: true,
      unpaged: false,
    },
  }));

  const pageParams = Array.from({ length: totalPages }, (_, i) => i * pageSize);

  return {
    ...(prev ?? {}),
    pages: normalized,
    pageParams,
  };
}

/**
 * Separate items into pinned and unpinned groups while maintaining order
 */
function separatePinnedItems<T>(
  items: T[],
  isPinned: (item: T) => boolean
): { pinned: T[]; unpinned: T[] } {
  const pinned: T[] = [];
  const unpinned: T[] = [];

  for (const item of items) {
    if (isPinned(item)) {
      pinned.push(item);
    } else {
      unpinned.push(item);
    }
  }

  return { pinned, unpinned };
}

/**
 * appendToOffsetPaginatedCache
 *
 * Inserts newest item(s) into an offset-paginated React Query cache (page 0, index 0)
 * and **reflows overflow across pages** to preserve server page boundaries.
 *
 * Designed for chat/conversation streams where page 0 holds the latest messages.
 * Works with caches shaped like:
 *   { pages: [{ content: T[] } | { items: T[] }, ...], pageParams?: number[] }
 *
 * Behavior
 * - If cache is empty (and `createIfEmpty`), seeds page 0 and builds additional pages from overflow.
 * - With `moveUpdatedToTop: true`, removes existing items with same id and adds them to page 0 top.
 * - With `moveUpdatedToTop: false`, updates existing items in place and only adds new items to top.
 * - With `isPinned` function provided, pinned items always stay at the top of page 0 regardless of updates.
 * - Prepends incoming to page 0; when a page exceeds `pageSize`, it shifts its tail to the next page,
 *   creating new pages as needed (true rollover: 0 ➜ 1 ➜ 2 ...).
 * - Recomputes `pageParams` as offsets: `[0, pageSize, 2*pageSize, ...]` and updates common page metadata.
 *
 * Notes
 * - This function does **not** sort; order is determined by existing cache order + incoming order.
 *   For "newest-first" at page 0, pass WS items in newest-first order, or pre-sort before calling.
 * - Use the exact same `queryKey` as your fetching hook; otherwise you'll update a different cache branch.
 * - Side effects are limited to `queryClient.setQueryData` (no network requests).
 *
 * Complexity
 * - O(P + N), where P is total items across cached pages and N is incoming batch size.
 *
 * Example
 * ```ts
 * appendToOffsetPaginatedCache<IMessage>(
 *   queryClient,
 *   QueryKeys.ConversationMessages(userId, conversationId),
 *   wsMessage, // or [wsMessage, ...]
 *   {
 *     getId: (m) => m.id,
 *     pageSize: 10,
 *     getPageItems: (p) => p.content,
 *     setPageItems: (p, items) => ({ ...p, content: items }),
 *     moveUpdatedToTop: true, // Move updated conversations to top
 *     isPinned: (m) => m.pinnedByLoggedInUser, // Keep pinned items at the top
 *   },
 * );
 * ```
 */
export function appendToOffsetPaginatedCache<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  incoming: T | T[],
  opts: AppendOptions<T>
) {
  const {
    getId,
    pageSize,
    getPageItems = (p: any) => (p?.content ?? p?.items ?? []) as T[],
    setPageItems = (p: any, items: T[]) =>
      "content" in (p ?? {}) ? { ...p, content: items } : { ...p, items },
    createIfEmpty = true,
    moveUpdatedToTop = false,
    isPinned = () => false,
  } = opts;

  const items = Array.isArray(incoming) ? incoming : [incoming];
  if (items.length === 0) return;

  queryClient.setQueryData<OffsetResult<T>>(queryKey, (data) => {
    // If there is no cache yet and allowed to create, seed it
    if (!data?.pages?.length) {
      if (!createIfEmpty) return data;

      // Separate pinned and unpinned items
      const { pinned, unpinned } = separatePinnedItems(items, isPinned);
      const orderedItems = [...pinned, ...unpinned];

      const first = setPageItems({}, orderedItems.slice(0, Math.min(orderedItems.length, pageSize)));
      const pages = [{ ...first }];
      // Carry any overflow beyond pageSize down the chain
      const carry =
        getPageItems(pages[0]).length > pageSize ? getPageItems(pages[0]).splice(pageSize) : [];
      while (carry.length) {
        const nextChunk = carry.splice(0, pageSize);
        pages.push(setPageItems({}, nextChunk));
      }
      return normalizeMetadata(pages, pageSize, data);
    }

    const pages = data.pages.map((p) => ({ ...p }));
    const incomingIds = new Set(items.map(getId));

    if (moveUpdatedToTop) {
      // Remove items with matching IDs from all pages
      for (let i = 0; i < pages.length; i++) {
        const pageItems = getPageItems(pages[i]);
        const filtered = pageItems.filter((item) => !incomingIds.has(getId(item)));
        pages[i] = setPageItems(pages[i], filtered);
      }

      // Collect all items from page 0 including new incoming
      const page0Items = getPageItems(pages[0]);
      const allPage0Items = [...items, ...page0Items];

      // Separate into pinned and unpinned
      const { pinned, unpinned } = separatePinnedItems(allPage0Items, isPinned);

      // Set page 0 with pinned items first, then unpinned
      pages[0] = setPageItems(pages[0], [...pinned, ...unpinned]);
    } else {
      // Don't move items - update in place
      const existingIds = new Set<string | number>();

      // Update existing items in their current positions
      for (let i = 0; i < pages.length; i++) {
        const pageItems = getPageItems(pages[i]);
        const updated = pageItems.map((item) => {
          const itemId = getId(item);
          existingIds.add(itemId);

          if (incomingIds.has(itemId)) {
            return items.find((inc) => getId(inc) === itemId) ?? item;
          }
          return item;
        });
        pages[i] = setPageItems(pages[i], updated);
      }

      // Only add NEW items to top
      const newItems = items.filter((item) => !existingIds.has(getId(item)));
      if (newItems.length > 0) {
        const page0Items = getPageItems(pages[0]);
        const allPage0Items = [...newItems, ...page0Items];

        // Separate into pinned and unpinned
        const { pinned, unpinned } = separatePinnedItems(allPage0Items, isPinned);

        // Set page 0 with pinned items first, then unpinned
        pages[0] = setPageItems(pages[0], [...pinned, ...unpinned]);
      }
    }

    // Reflow overflow down the chain
    let carry: T[] = [];
    for (let i = 0; i < pages.length; i++) {
      const curr = [...getPageItems(pages[i])];

      // If we came here with a carry, we need to merge it properly
      if (carry.length) {
        if (i === 0) {
          // For page 0, maintain pinned items at top
          const { pinned, unpinned } = separatePinnedItems([...carry, ...curr], isPinned);
          pages[i] = setPageItems(pages[i], [...pinned, ...unpinned]);
        } else {
          // For other pages, just prepend carry
          pages[i] = setPageItems(pages[i], [...carry, ...curr]);
        }
      }

      const pageItems = [...getPageItems(pages[i])];

      if (pageItems.length > pageSize) {
        if (i === 0) {
          // For page 0, ensure we don't split pinned items across pages
          const { pinned, unpinned } = separatePinnedItems(pageItems, isPinned);

          if (pinned.length >= pageSize) {
            // If pinned items alone fill or exceed pageSize, keep all pinned items
            // and move unpinned items to carry
            pages[i] = setPageItems(pages[i], pinned);
            carry = unpinned;
          } else {
            // Keep all pinned items + as many unpinned as fit
            const remainingSpace = pageSize - pinned.length;
            const keptUnpinned = unpinned.slice(0, remainingSpace);
            const carriedUnpinned = unpinned.slice(remainingSpace);

            pages[i] = setPageItems(pages[i], [...pinned, ...keptUnpinned]);
            carry = carriedUnpinned;
          }
        } else {
          // For other pages, just split at pageSize
          carry = pageItems.splice(pageSize);
          pages[i] = setPageItems(pages[i], pageItems);
        }
      } else {
        carry = [];
      }
    }

    // Create new pages as needed to hold remaining carry
    while (carry.length) {
      const nextChunk = carry.splice(0, pageSize);
      const newPage = setPageItems({}, nextChunk);
      pages.push(newPage);
    }

    return normalizeMetadata(pages, pageSize, data);
  });
}