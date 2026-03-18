# QuickNav - Chrome Extension

## What is this?
A Raycast-style command palette Chrome extension for navigating browser resources (history, bookmarks, tabs) via Cmd+K / Ctrl+K.

## Tech Stack
- Chrome Extension Manifest V3
- React (UI)
- TailwindCSS (styling)
- Vite (bundling)
- Fuse.js (fuzzy search)
- IndexedDB (local storage)

## Project Structure
```
/src
  /background    - Service worker, indexing, data sync
  /content       - Content script injecting the command palette
  /popup         - React popup app
  /lib
    search.ts    - Fuse.js search integration
    ranking.ts   - Frecency ranking (match score + visit frequency + recency + bookmark boost)
    commands.ts  - Command alias parsing (gh, yt, etc.)
    storage.ts   - IndexedDB storage layer
```

## Key Design Decisions
- All search is local-only (privacy-first, no API calls)
- Results must appear in <100ms
- Must scale to 10k-50k history items
- Initial indexing: last ~6 months of history
- Incremental updates via chrome.history.onVisited
- Data cleanup: remove low-value items (low visit count, >90 days old), cap at ~10k items

## Build Phases
1. Chrome extension setup, manifest, basic popup UI, keyboard shortcut
2. Fetch history + bookmarks + tabs, build local index
3. Integrate Fuse.js search, display results
4. Ranking improvements (frecency)
5. Command parsing (gh, yt, etc.)
6. Polish UI (animations, keyboard UX)

## UI Requirements
- Centered overlay command palette
- Dark mode UI with smooth animations (fade + slight scale)
- Max 6-8 visible results with favicon, title, URL
- Keyboard: arrows navigate, Enter opens, Cmd+Enter new tab, Esc closes
- Search input autofocus with placeholder "Search tabs, history, bookmarks..."

## Commands
- `gh <query>` → GitHub search
- `yt <query>` → YouTube search
- Extensible command alias system
