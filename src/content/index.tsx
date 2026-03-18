import React from "react";
import { createRoot } from "react-dom/client";
import { CommandPalette } from "../components/CommandPalette";
import "./index.css";

// Create a host element for the command palette
const host = document.createElement("div");
host.id = "quicknav-root";
document.body.appendChild(host);

const root = createRoot(host);
root.render(<CommandPalette />);
