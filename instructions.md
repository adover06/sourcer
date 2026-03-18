# QuickNav - Full Build Instructions

## PRODUCT OVERVIEW

QuickNav is a Chrome extension that opens a command palette (via Cmd+K / Ctrl+K) allowing users to:

* Search browser history
* Search bookmarks
* Search open tabs
* Navigate instantly to results
* Use keyboard navigation (arrow keys + enter)
* Support simple command shortcuts (e.g. "gh react")

The experience should feel like: Raycast / Spotlight / Linear command palette

---

## CORE REQUIREMENTS

### 1. Performance

* Results must appear in <100ms
* All search must be local (no API calls)
* Must scale to 10k–50k history items

### 2. Search Engine

* Use Fuse.js for fuzzy search
* Search across: title, URL
* Implement ranking that includes:
  * fuzzy match score
  * visit frequency (visitCount)
  * recency (lastVisitTime)
  * bookmark boost

### 3. Data Sources

Use Chrome APIs:
* chrome.history
* chrome.bookmarks
* chrome.tabs

### 4. Data Strategy

* Initial indexing on extension load (last ~6 months)
* Incremental updates using: chrome.history.onVisited
* Store data in IndexedDB (not just chrome.storage)

### 5. Data Cleanup

* Remove low-value items:
  * low visit count
  * old entries (>90 days)
* Keep index size manageable (~10k items)

---

## UI / UX REQUIREMENTS

### Command Palette

* Opens with Cmd+K / Ctrl+K
* Centered overlay
* Dark mode UI
* Smooth animation (fade + slight scale)

### Search Input

* Autofocus on open
* Placeholder: "Search tabs, history, bookmarks..."

### Results List

* Max 6–8 visible results
* Each result shows:
  * favicon
  * title
  * URL (faded)
* Highlight selected result

### Keyboard Controls

* ↑ ↓ navigate
* Enter = open
* Cmd+Enter = open in new tab
* Esc = close

### UX Details

* Instant feedback while typing
* No loading spinners
* Prioritize most likely result automatically

---

## COMMAND SYSTEM

Support basic command aliases:

Examples:
* "gh react" → https://github.com/search?q=react
* "yt cats" → https://youtube.com/results?search_query=cats

Design a simple command parsing system.

---

## PROJECT STRUCTURE

Use:
* Manifest V3
* React (for UI)
* TailwindCSS (for styling)
* Vite (for bundling)

Structure:
```
/src
  /background
  /content
  /popup (React app)
  /lib
    search.ts
    ranking.ts
    commands.ts
    storage.ts
```

---

## IMPLEMENTATION PLAN

### Phase 1 - Extension Setup
* Chrome extension setup
* Manifest
* Basic popup UI
* Keyboard shortcut working

### Phase 2 - Data Layer
* Fetch history + bookmarks + tabs
* Build local index

### Phase 3 - Search
* Integrate Fuse.js search
* Display results

### Phase 4 - Ranking
* Add ranking improvements (frecency)

### Phase 5 - Commands
* Add command parsing (gh, yt, etc.)

### Phase 6 - Polish
* Polish UI (animations, keyboard UX)

---

## GUIDELINES

* Keep everything local-first (privacy focused)
* Optimize for simplicity over complexity
* Use best practices for Chrome extensions
* Real working code, no pseudo-code
* Clean and minimal implementation
