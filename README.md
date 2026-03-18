# Sourcer

<p align="center">
  <img src="public/icon128.png" alt="Sourcer logo" width="80" />
</p>

<p align="center">
  <strong>A command palette for Chrome — instantly search tabs, history, and bookmarks.</strong>
</p>

---

## What is Sourcer?

Sourcer is a Chrome extension that brings a Raycast / Spotlight-style command palette to your browser. Press **Cmd+K** (Mac) or **Ctrl+K** (Windows/Linux) on any page to instantly search across your open tabs, browsing history, and bookmarks — all local, all private.

## Features

- **Fuzzy search** across titles and URLs powered by Fuse.js
- **Unified results** from tabs, history, and bookmarks (deduplicated)
- **Keyboard-first** — arrow keys to navigate, Enter to open, Cmd+Enter for new tab, Esc to close
- **Fast** — local-only search, no API calls, indexes up to 10k items
- **Privacy-focused** — all data stays in your browser, nothing leaves your machine
- **Dark UI** — minimal black/white design, isolated via Shadow DOM so it never clashes with page styles

## Getting Started

### Prerequisites

- Node.js 18+
- Chrome browser

### Install & Build

```bash
npm install
npm run build
```

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `dist/` folder
4. Navigate to any page and press **Cmd+K**

## Tech Stack

- **Manifest V3** Chrome Extension
- **React** + **TypeScript**
- **TailwindCSS v4**
- **Vite** (bundler)
- **Fuse.js** (fuzzy search)

## Project Structure

```
src/
  background/    Service worker — indexing, search, tab management
  content/       Content script — injects the command palette via Shadow DOM
  components/    React UI components
  lib/           Data fetching, search engine, types
public/
  manifest.json  Chrome extension manifest
  icon*.png      Extension icons
```

## License

ISC
