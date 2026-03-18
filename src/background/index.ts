// Background service worker for QuickNav
// Listens for the keyboard shortcut and tells the content script to toggle the palette

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PALETTE" });
  }
});

// Also handle the command directly
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "_execute_action" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PALETTE" });
  }
});
