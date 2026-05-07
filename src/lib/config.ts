export interface SearchConfig {
  threshold: number;
  titleWeight: number;
  urlWeight: number;
  minMatchCharLength: number;
  maxResults: number;
  ignoreLocation: boolean;
  historyMonths: number;
  historyMaxItems: number;
  searchDebounceMs: number;
  searchDebounceBypassLength: number;
}

export const DEFAULT_CONFIG: SearchConfig = {
  threshold: 0.5,
  titleWeight: 0.3,
  urlWeight: 0.6,
  minMatchCharLength: 2,
  maxResults: 8,
  ignoreLocation: false,
  historyMonths: 6,
  historyMaxItems: 10000,
  searchDebounceMs: 150,
  searchDebounceBypassLength: 3,
};

export async function loadConfig(): Promise<SearchConfig> {
  const result = await chrome.storage.sync.get("searchConfig");
  return { ...DEFAULT_CONFIG, ...(result.searchConfig ?? {}) };
}

export async function saveConfig(config: SearchConfig): Promise<void> {
  await chrome.storage.sync.set({ searchConfig: config });
}
