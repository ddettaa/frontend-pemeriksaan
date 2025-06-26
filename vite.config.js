import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/pendaftaran": {
        target: "https://ti054a01.agussbn.my.id",
        changeOrigin: true,
        secure: false,
      },
      "/api/pemeriksaan": {
        target: "https://ti054a02.agussbn.my.id",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
