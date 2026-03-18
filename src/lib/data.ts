import { SearchItem } from "./types";

/** Fetch all open tabs */
export async function fetchTabs(): Promise<SearchItem[]> {
  const tabs = await chrome.tabs.query({});
  return tabs
    .filter((t) => t.url && !t.url.startsWith("chrome://"))
    .map((t) => ({
      id: `tab-${t.id}`,
      title: t.title || t.url || "",
      url: t.url!,
      source: "tab" as const,
      tabId: t.id,
    }));
}

/** Fetch recent history (last 6 months, max 10k) */
export async function fetchHistory(): Promise<SearchItem[]> {
  const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
  const items = await chrome.history.search({
    text: "",
    startTime: sixMonthsAgo,
    maxResults: 10000,
  });
  return items
    .filter((h) => h.url && h.title)
    .map((h) => ({
      id: `history-${h.url}`,
      title: h.title || "",
      url: h.url!,
      source: "history" as const,
      visitCount: h.visitCount ?? 0,
      lastVisitTime: h.lastVisitTime ?? 0,
    }));
}

/** Fetch all bookmarks (recursive) */
export async function fetchBookmarks(): Promise<SearchItem[]> {
  const tree = await chrome.bookmarks.getTree();
  const results: SearchItem[] = [];

  function walk(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
    for (const node of nodes) {
      if (node.url) {
        results.push({
          id: `bookmark-${node.id}`,
          title: node.title || node.url,
          url: node.url,
          source: "bookmark" as const,
        });
      }
      if (node.children) walk(node.children);
    }
  }

  walk(tree);
  return results;
}

/** Fetch all data sources and deduplicate by URL */
export async function fetchAll(): Promise<SearchItem[]> {
  const [tabs, history, bookmarks] = await Promise.all([
    fetchTabs(),
    fetchHistory(),
    fetchBookmarks(),
  ]);

  // Deduplicate: tabs win over bookmarks win over history
  const seen = new Map<string, SearchItem>();

  for (const item of history) {
    seen.set(item.url, item);
  }
  for (const item of bookmarks) {
    const existing = seen.get(item.url);
    seen.set(item.url, {
      ...item,
      visitCount: existing?.visitCount ?? 0,
      lastVisitTime: existing?.lastVisitTime ?? 0,
    });
  }
  for (const item of tabs) {
    const existing = seen.get(item.url);
    seen.set(item.url, {
      ...item,
      visitCount: existing?.visitCount ?? 0,
      lastVisitTime: existing?.lastVisitTime ?? 0,
    });
  }

  return Array.from(seen.values());
}
