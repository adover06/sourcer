import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Chrome extensions need IIFE format for content scripts (no ES modules).
// We build each entry separately via BUILD_ENTRY env var.
const entry = process.env.BUILD_ENTRY || "content";

const inputs: Record<string, string> = {
  content: resolve(__dirname, "src/content/index.tsx"),
  background: resolve(__dirname, "src/background/index.ts"),
  options: resolve(__dirname, "src/options/index.tsx"),
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
        format: "iife",
        entryFileNames: `${entry}.js`,
        assetFileNames: `${entry}.[ext]`,
      },
    },
    minify: false,
  },
});
