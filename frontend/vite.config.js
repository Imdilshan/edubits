import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("html2pdf") || id.includes("html2canvas") || id.includes("jspdf")) {
            return "pdf-vendor";
          }

          if (id.includes("lucide-react") || id.includes("react-icons")) {
            return "icons-vendor";
          }

          if (/node_modules\/(react|react-dom|react-router-dom)\//.test(id)) {
            return "react-vendor";
          }

          if (id.includes("@vercel")) {
            return "vercel-vendor";
          }

          return undefined;
        },
      },
    },
  },
})
