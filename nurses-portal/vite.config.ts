import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    open: false,
    cors: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
