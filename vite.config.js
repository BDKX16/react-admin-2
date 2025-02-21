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
  },
});
