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
  dedupeAcrossPages?: boolean;
  /** Optional: if true, and there are zero pages yet, create page[0] */
  createIfEmpty?: boolean;
};

/** Normalize paging metadata & pageParams offsets */
function normalizeMetadata<T extends Record<string, any>>(
  pages: T[],
  pageSize: number,
  prev?: any,
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
 * - De-dupes by id **across all pages** (optional) before insert.
 * - Prepends incoming to page 0; when a page exceeds `pageSize`, it shifts its tail to the next page,
 *   creating new pages as needed (true rollover: 0 ➜ 1 ➜ 2 ...).
 * - Recomputes `pageParams` as offsets: `[0, pageSize, 2*pageSize, ...]` and updates common page metadata.
 *
 * Notes
 * - This function does **not** sort; order is determined by existing cache order + incoming order.
 *   For “newest-first” at page 0, pass WS items in newest-first order, or pre-sort before calling.
 * - Use the exact same `queryKey` as your fetching hook; otherwise you’ll update a different cache branch.
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
 *     dedupeAcrossPages: true,
 *   },
 * );
 * ```
 */
export function appendToOffsetPaginatedCache<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  incoming: T | T[],
  opts: AppendOptions<T>,
) {
  const {
    getId,
    pageSize,
    getPageItems = (p: any) => (p?.content ?? p?.items ?? []) as T[],
    setPageItems = (p: any, items: T[]) =>
      "content" in (p ?? {}) ? { ...p, content: items } : { ...p, items },
    dedupeAcrossPages = true,
    createIfEmpty = true,
  } = opts;

  const items = Array.isArray(incoming) ? incoming : [incoming];
  if (items.length === 0) return;

  queryClient.setQueryData<OffsetResult<T>>(queryKey, (data) => {
    // If there is no cache yet and allowed to create, seed it
    if (!data?.pages?.length) {
      if (!createIfEmpty) return data;
      const first = setPageItems(
        {},
        items.slice(0, Math.min(items.length, pageSize)),
      );
      const pages = [{ ...first }];
      // Carry any overflow beyond pageSize down the chain
      let carry =
        getPageItems(pages[0]).length > pageSize
          ? getPageItems(pages[0]).splice(pageSize)
          : [];
      while (carry.length) {
        const nextChunk = carry.splice(0, pageSize);
        pages.push(setPageItems({}, nextChunk));
      }
      return normalizeMetadata(pages, pageSize, data);
    }

    const pages = data.pages.map((p) => ({ ...p }));

    // De-dupe existing occurrences across all pages (optional)
    if (dedupeAcrossPages) {
      const ids = new Set(items.map(getId));
      for (let i = 0; i < pages.length; i++) {
        const curr = [...getPageItems(pages[i])];
        const filtered = curr.filter((x) => !ids.has(getId(x)));
        if (filtered.length !== curr.length) {
          pages[i] = setPageItems(pages[i], filtered);
        }
      }
    }

    // Insert into page 0 at index 0 (newest-first)
    {
      const p0 = pages[0];
      const p0Items = [...getPageItems(p0)];
      // Put newest batch at the very front (preserving incoming order: last → first will appear reversed if you care; reverse here if needed)
      const next = [...items, ...p0Items];
      pages[0] = setPageItems(p0, next);
    }

    // Reflow overflow down the chain
    let carry: T[] = [];
    for (let i = 0; i < pages.length; i++) {
      const curr = [...getPageItems(pages[i])];

      // If we came here with a carry, unshift it (carry is newest for this page)
      if (carry.length) {
        pages[i] = setPageItems(pages[i], [...carry, ...curr]);
      }

      let pageItems = [...getPageItems(pages[i])];
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
