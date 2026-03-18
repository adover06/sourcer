import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Chrome extensions need IIFE format (no ES modules in content scripts).
// Rollup can't do IIFE with multiple inputs, so we build each entry separately.
// The `BUILD_ENTRY` env var selects which entry to build.
const entry = process.env.BUILD_ENTRY || "content";

const inputs: Record<string, { input: string; cssName?: string }> = {
  content: {
    input: resolve(__dirname, "src/content/index.tsx"),
    cssName: "content",
  },
  background: {
    input: resolve(__dirname, "src/background/index.ts"),
  },
};

const current = inputs[entry];

export default defineConfig({
  plugins: [react()],
  publicDir: entry === "content" ? "public" : false,
  build: {
    outDir: "dist",
    emptyOutDir: entry === "content", // Only clear on first build
    rollupOptions: {
      input: current.input,
      output: {
        format: "iife",
        entryFileNames: `${entry}.js`,
        assetFileNames: "content.[ext]",
      },
    },
    minify: false,
    cssCodeSplit: false,
  },
});
