import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.posix.resolve("packages/react"),
      shared: path.posix.resolve("packages/shared"),
      "react-dom": path.resolve("packages/react-dom"),
      "react-reconciler": path.resolve("packages/react-reconciler"),
      "react-dom-bindings": path.resolve("packages/react-dom-bindings"),
    },
  },
});
