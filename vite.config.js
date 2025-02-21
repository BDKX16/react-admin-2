import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "static",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Dividir los módulos en un chunk separado
            return "vendor";
          }
        },
        entryFileNames: "static/js/[name]-[hash].js",
        chunkFileNames: "static/js/[name]-[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.css$/i.test(name ?? "")) {
            return "static/css/[name]-[hash][extname]";
          }
          return "static/[name]-[hash][extname]";
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Ajustar el límite de tamaño de chunk a 1000 kB
  },
});
