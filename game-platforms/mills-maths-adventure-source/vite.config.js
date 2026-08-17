import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standard Vite + React config. Nothing game-specific lives here.
export default defineConfig({
  plugins: [react()],
  // Relative base so the built app works when served from a SUBFOLDER of the
  // website (e.g. /game-platforms/mills-maths-adventure/) — assets load relative
  // to index.html instead of from the site root.
  base: "./",
  server: {
    port: 5173,
    open: true,
  },
});
