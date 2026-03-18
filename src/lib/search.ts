import Fuse from "fuse.js";
import { SearchItem } from "./types";
import { SearchConfig, DEFAULT_CONFIG } from "./config";

let fuse: Fuse<SearchItem> | null = null;
let items: SearchItem[] = [];
let currentConfig: SearchConfig = DEFAULT_CONFIG;

/** Initialize/update the search index with config */
export function buildIndex(data: SearchItem[], config: SearchConfig = DEFAULT_CONFIG) {
  items = data;
  currentConfig = config;
  fuse = new Fuse(items, {
    keys: [
      { name: "title", weight: config.titleWeight },
      { name: "url", weight: config.urlWeight },
    ],
    threshold: config.threshold,
    includeScore: true,
    minMatchCharLength: config.minMatchCharLength,
    ignoreLocation: config.ignoreLocation,
  });
}

/** Search the index, return top N results */
export function search(query: string, limit?: number): SearchItem[] {
  const max = limit ?? currentConfig.maxResults;

  if (!fuse || !query.trim()) {
    return items
      .slice()
      .sort((a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0))
      .slice(0, max);
  }

  return fuse
    .search(query, { limit: max })
    .map((r) => r.item);
}
