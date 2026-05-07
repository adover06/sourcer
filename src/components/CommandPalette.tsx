import { useState, useEffect, useRef, useCallback } from "react";
import type { SearchItem } from "../lib/types";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setQuery("");
        setSelectedIndex(0);
        setResults([]);
      }
      return !prev;
    });
  }, []);

  // Listen for toggle from background script
  useEffect(() => {
    const handler = (message: { type: string }) => {
      if (message.type === "TOGGLE_PALETTE") toggle();
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [toggle]);

  // Cmd+K / Ctrl+K directly on the page
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [toggle]);

  // Autofocus
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isOpen) return;

    timeoutRef.current = setTimeout(() => {
      chrome.runtime.sendMessage(
        { type: "SEARCH", query },
        (response: { results: SearchItem[] } | undefined) => {
          if (response?.results) {
            const items = response.results;
            if (query.trim()) {
              items.push({
                id: "search-google",
                title: `Search Google for "${query}"`,
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                source: "search",
              });
            }
            setResults(items);
            setSelectedIndex(0);
          }
        }
      );
    }, 150);

    return () => clearTimeout(timeoutRef.current!);
  }, [query, isOpen]);

  // Navigate to a result
  const openResult = useCallback(
    (item: SearchItem, newTab: boolean) => {
      if (item.source === "tab" && item.tabId && !newTab) {
        chrome.runtime.sendMessage({ type: "OPEN_TAB", tabId: item.tabId });
      } else {
        chrome.runtime.sendMessage({
          type: "OPEN_URL",
          url: item.url,
          newTab,
        });
      }
      setIsOpen(false);
    },
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter": {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) openResult(selected, e.metaKey || e.ctrlKey);
        break;
      }
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  if (!isOpen) return null;

  const sourceLabel: Record<string, string> = {
    tab: "TAB",
    history: "HISTORY",
    bookmark: "BOOKMARK",
    search: "GOOGLE",
  };

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-start justify-center pt-[20vh]"
      onClick={() => setIsOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 animate-fade-in" />

      {/* Palette */}
      <div
        className="relative w-full max-w-[600px] mx-4 bg-[#0a0a0a] rounded-lg border border-[#222] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a]">
          <svg
            className="w-4 h-4 text-[#555] shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tabs, history, bookmarks..."
            className="flex-1 bg-transparent text-[#e0e0e0] text-sm font-mono outline-none placeholder:text-[#444] caret-[#888]"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#444] bg-[#111] rounded border border-[#222]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {results.length === 0 && query.length === 0 && (
            <div className="px-4 py-10 text-center text-[#333] text-xs font-mono tracking-wide">
              Type to search across your browser
            </div>
          )}
          {results.map((result, index) => (
            <button
              key={result.id}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-75 border-l-2 ${
                index === selectedIndex
                  ? "bg-[#111] border-[#e0e0e0]"
                  : "border-transparent hover:bg-[#0d0d0d]"
              }`}
              onClick={() => openResult(result, false)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-mono truncate ${
                    index === selectedIndex ? "text-white" : "text-[#999]"
                  }`}
                >
                  {result.title || result.url}
                </div>
                <div className="text-[11px] font-mono text-[#333] truncate mt-0.5">
                  {result.url}
                </div>
              </div>
              <span
                className={`text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded ${
                  result.source === "tab"
                    ? "text-[#4a9] bg-[#4a9]/10 border border-[#4a9]/20"
                    : result.source === "bookmark"
                      ? "text-[#a9a] bg-[#a9a]/10 border border-[#a9a]/20"
                      : result.source === "search"
                        ? "text-[#88f] bg-[#88f]/10 border border-[#88f]/20"
                        : "text-[#555] bg-[#111] border border-[#1a1a1a]"
                }`}
              >
                {sourceLabel[result.source]}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-5 px-4 py-2 border-t border-[#1a1a1a]">
          <span className="text-[10px] font-mono text-[#333]">
            <kbd className="px-1 py-0.5 bg-[#111] rounded border border-[#222] text-[#444]">
              ↑↓
            </kbd>{" "}
            navigate
          </span>
          <span className="text-[10px] font-mono text-[#333]">
            <kbd className="px-1 py-0.5 bg-[#111] rounded border border-[#222] text-[#444]">
              ↵
            </kbd>{" "}
            open
          </span>
          <span className="text-[10px] font-mono text-[#333]">
            <kbd className="px-1 py-0.5 bg-[#111] rounded border border-[#222] text-[#444]">
              ⌘↵
            </kbd>{" "}
            new tab
          </span>
          <span className="ml-auto flex items-center gap-3">
            {results.length > 0 && (
              <span className="text-[10px] font-mono text-[#333]">
                {results.length} results
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                chrome.runtime.sendMessage({ type: "OPEN_URL", url: chrome.runtime.getURL("options.html"), newTab: true });
                setIsOpen(false);
              }}
              className="text-[#333] hover:text-[#666] transition-colors"
              title="Settings"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
