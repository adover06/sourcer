import { fetchAll } from "../lib/data";
import { buildIndex, search } from "../lib/search";
import { loadConfig } from "../lib/config";

// Build the search index on startup
async function init() {
  const config = await loadConfig();
  const data = await fetchAll(config.historyMonths, config.historyMaxItems);
  buildIndex(data, config);
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
    const results = search(message.query);
    sendResponse({ results });
    return true;
  }

  if (message.type === "CONFIG_UPDATED") {
    // Rebuild index with new config
    init().then(() => sendResponse({ ok: true }));
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
