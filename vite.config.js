import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7038", // Backend HTTPS portu
        changeOrigin: true,
        secure: false, // Localhost self-signed SSL'i kabul et
        followRedirects: false, // HTTP→HTTPS redirect'i proxy'de takip etme
      },
      "/chatHub": {
        target: "https://localhost:7038", // SignalR Hub
        ws: true, // WebSocket desteği
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
