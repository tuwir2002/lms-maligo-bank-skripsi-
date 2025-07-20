import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "172.16.57.16",
    proxy: {
      "/api": {
        target: "http://localhost:6003/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    host: "172.16.57.16",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:6003/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
