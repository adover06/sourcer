export interface SearchItem {
  id: string;
  title: string;
  url: string;
  source: "tab" | "history" | "bookmark";
  visitCount?: number;
  lastVisitTime?: number;
  tabId?: number;
}
