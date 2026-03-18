import React, { useState, useEffect, useRef, useCallback } from "react";

interface SearchResult {
  id: string;
  title: string;
  url: string;
  source: "tab" | "history" | "bookmark";
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle palette open/close
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

  // Listen for messages from the background script
  useEffect(() => {
    const handler = (message: { type: string }) => {
      if (message.type === "TOGGLE_PALETTE") {
        toggle();
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [toggle]);

  // Also listen for Cmd+K / Ctrl+K directly in the page
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

  // Autofocus input when palette opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to let animation start
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Keyboard navigation inside the palette
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
        if (selected) {
          if (e.metaKey || e.ctrlKey) {
            // Open in new tab
            window.open(selected.url, "_blank");
          } else {
            window.location.href = selected.url;
          }
          setIsOpen(false);
        }
        break;
      }
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-start justify-center pt-[15vh]"
      onClick={() => setIsOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />

      {/* Palette */}
      <div
        className="relative w-full max-w-[640px] bg-[#1e1e2e] rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-white/10">
          <svg
            className="w-5 h-5 text-white/40 mr-3 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tabs, history, bookmarks..."
            className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-white/30"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-white/30 bg-white/5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 && query.length === 0 && (
            <div className="px-4 py-8 text-center text-white/30 text-sm">
              Type to search tabs, history, and bookmarks
            </div>
          )}
          {results.length === 0 && query.length > 0 && (
            <div className="px-4 py-8 text-center text-white/30 text-sm">
              No results found
            </div>
          )}
          {results.map((result, index) => (
            <button
              key={result.id}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                index === selectedIndex
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5"
              }`}
              onClick={() => {
                window.location.href = result.url;
                setIsOpen(false);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <img
                src={`chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(result.url)}&size=16`}
                alt=""
                className="w-4 h-4 shrink-0 rounded-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm truncate">{result.title}</div>
                <div className="text-xs text-white/30 truncate">
                  {result.url}
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 shrink-0">
                {result.source}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/10 text-[10px] text-white/20">
          <span>
            <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">
              ↑↓
            </kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">
              ↵
            </kbd>{" "}
            open
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">
              ⌘↵
            </kbd>{" "}
            new tab
          </span>
        </div>
      </div>
    </div>
  );
}
