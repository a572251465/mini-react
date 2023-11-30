import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.posix.resolve("packages/react"),
      shared: path.posix.resolve("packages/shared"),
    },
  },
});