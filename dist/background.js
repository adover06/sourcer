(function() {
	//#region src/background/index.ts
	chrome.action.onClicked.addListener((tab) => {
		if (tab.id) chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PALETTE" });
	});
	chrome.commands.onCommand.addListener((command, tab) => {
		if (command === "_execute_action" && tab?.id) chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PALETTE" });
	});
	//#endregion
})();
