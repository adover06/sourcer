import Fuse from "fuse.js";
import { SearchItem } from "./types";

let fuse: Fuse<SearchItem> | null = null;
let items: SearchItem[] = [];

/** Initialize/update the search index */
export function buildIndex(data: SearchItem[]) {
  items = data;
  fuse = new Fuse(items, {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "url", weight: 0.3 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 1,
  });
}

/** Search the index, return top N results */
export function search(query: string, limit = 8): SearchItem[] {
  if (!fuse || !query.trim()) {
    // No query — return most recent / most visited
    return items
      .slice()
      .sort((a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0))
      .slice(0, limit);
  }

  return fuse
    .search(query, { limit })
    .map((r) => r.item);
}
