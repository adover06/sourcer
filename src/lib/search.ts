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

/**
 * Deduplicate results by title — keep the one with the best score,
 * boost its visitCount by the number of duplicates merged.
 */
function dedupeByTitle(results: { item: SearchItem; score?: number }[]): SearchItem[] {
  const seen = new Map<string, { item: SearchItem; score: number; count: number }>();

  for (const r of results) {
    const title = r.item.title.toLowerCase().trim();
    const score = r.score ?? 1;
    const existing = seen.get(title);

    if (!existing || score < existing.score) {
      // Better match — replace but carry over the count
      seen.set(title, {
        item: r.item,
        score,
        count: (existing?.count ?? 0) + 1,
      });
    } else {
      // Duplicate — just bump the count
      existing.count++;
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => a.score - b.score)
    .map((entry) => ({
      ...entry.item,
      // Boost visitCount so duplicates rank higher
      visitCount: (entry.item.visitCount ?? 0) + entry.count,
    }));
}

/** Search the index, return top N results */
export function search(query: string, limit?: number): SearchItem[] {
  const max = limit ?? currentConfig.maxResults;

  if (!fuse || !query.trim()) {
    // No query — return recent, deduped by title
    const seen = new Set<string>();
    return items
      .slice()
      .sort((a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0))
      .filter((item) => {
        const key = item.title.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, max);
  }

  // Fetch more than needed so we have enough after deduplication
  const raw = fuse.search(query, { limit: max * 3 });
  return dedupeByTitle(raw).slice(0, max);
}
