import React from "react";
import { createRoot } from "react-dom/client";
import { CommandPalette } from "../components/CommandPalette";

// Create a host element with Shadow DOM for full style isolation
const host = document.createElement("div");
host.id = "quicknav-root";
// Ensure the host doesn't interfere with page layout
host.style.cssText = "all: initial; position: fixed; z-index: 2147483647; top: 0; left: 0; width: 0; height: 0;";
document.documentElement.appendChild(host);

const shadow = host.attachShadow({ mode: "open" });

// Load our CSS into the shadow DOM
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = chrome.runtime.getURL("content.css");
shadow.appendChild(link);

// React mount point inside shadow DOM
const container = document.createElement("div");
container.id = "quicknav-container";
shadow.appendChild(container);

const root = createRoot(container);
root.render(<CommandPalette />);
