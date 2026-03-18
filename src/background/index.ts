import { fetchAll } from "../lib/data";
import { buildIndex, search } from "../lib/search";

// Build the search index on startup
async function init() {
  const data = await fetchAll();
  buildIndex(data);
  console.log(`[Sourcer] Indexed ${data.length} items`);
}

init();

// Rebuild index on new history visits (debounced)
let rebuildTimer: ReturnType<typeof setTimeout>;
chrome.history.onVisited.addListener(() => {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(init, 5000);
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SEARCH") {
    const results = search(message.query, 8);
    sendResponse({ results });
    return true;
  }

  if (message.type === "OPEN_TAB") {
    chrome.tabs.update(message.tabId, { active: true });
    if (message.windowId) {
      chrome.windows.update(message.windowId, { focused: true });
    }
    return;
  }

  if (message.type === "OPEN_URL") {
    if (message.newTab) {
      chrome.tabs.create({ url: message.url });
    } else {
      chrome.tabs.update({ url: message.url });
    }
    return;
  }
});

// Toggle palette when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PALETTE" });
  } catch {
    // Content script not loaded on this tab (chrome:// pages, etc.) — inject it
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["content.css"],
      });
      await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PALETTE" });
    } catch {
      // Page doesn't allow script injection (chrome://, web store, etc.)
    }
  }
});
