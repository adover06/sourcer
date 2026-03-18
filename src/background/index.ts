import { fetchAll } from "../lib/data";
import { buildIndex, search } from "../lib/search";

// Build the search index on startup
async function init() {
  const data = await fetchAll();
  buildIndex(data);
  console.log(`[Sourcer] Indexed ${data.length} items`);
}

init();

// Rebuild index periodically and on new visits
chrome.history.onVisited.addListener(() => {
  // Debounce: rebuild at most every 5 seconds
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(init, 5000);
});

let rebuildTimer: ReturnType<typeof setTimeout>;

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SEARCH") {
    const results = search(message.query, 8);
    sendResponse({ results });
    return true; // async response
  }

  if (message.type === "OPEN_TAB") {
    // Switch to an existing tab
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

// Also toggle palette when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PALETTE" });
  }
});
