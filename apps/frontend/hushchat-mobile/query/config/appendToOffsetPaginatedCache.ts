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
  } = opts;

  const items = Array.isArray(incoming) ? incoming : [incoming];
  if (items.length === 0) return;

  queryClient.setQueryData<OffsetResult<T>>(queryKey, (data) => {
    // If there is no cache yet and allowed to create, seed it
    if (!data?.pages?.length) {
      if (!createIfEmpty) return data;
      const first = setPageItems({}, items.slice(0, Math.min(items.length, pageSize)));
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

      // Add all incoming items to top of page 0
      const page0Items = getPageItems(pages[0]);
      pages[0] = setPageItems(pages[0], [...items, ...page0Items]);
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
        pages[0] = setPageItems(pages[0], [...newItems, ...page0Items]);
      }
    }

    // Reflow overflow down the chain
    let carry: T[] = [];
    for (let i = 0; i < pages.length; i++) {
      const curr = [...getPageItems(pages[i])];

      // If we came here with a carry, unshift it (carry is newest for this page)
      if (carry.length) {
        pages[i] = setPageItems(pages[i], [...carry, ...curr]);
      }

      const pageItems = [...getPageItems(pages[i])];
      if (pageItems.length > pageSize) {
        // Pop from the end (oldest within this page) to carry to the next
        carry = pageItems.splice(pageSize);
        pages[i] = setPageItems(pages[i], pageItems);
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
