import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 8080,
    host: true,
    allowedHosts: ["frontend-deploy-qa-sprint3.up.railway.app", "frontend-deploy-production.up.railway.app", "worksense-frontend-pre-produccion-sprint-3.up.railway.app"],
  },
});
