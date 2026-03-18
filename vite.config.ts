import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Chrome extensions need IIFE format for content scripts (no ES modules).
// Background service workers support ES modules.
// We build each entry separately via BUILD_ENTRY env var.
const entry = process.env.BUILD_ENTRY || "content";

const inputs: Record<string, string> = {
  content: resolve(__dirname, "src/content/index.tsx"),
  background: resolve(__dirname, "src/background/index.ts"),
};

const isContent = entry === "content";

export default defineConfig({
  plugins: [react()],
  publicDir: isContent ? "public" : false,
  build: {
    outDir: "dist",
    emptyOutDir: isContent,
    cssCodeSplit: false,
    rollupOptions: {
      input: inputs[entry],
      output: {
        // Content scripts: IIFE (no module support)
        // Background: IIFE too (simpler, single file)
        format: "iife",
        entryFileNames: `${entry}.js`,
        assetFileNames: "content.[ext]",
      },
    },
    minify: false,
  },
});
