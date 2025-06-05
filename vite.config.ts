/// <reference types="vitest" />
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  clearScreen: false,
  base: "",
  server: {
    port: 8080,
    open: true,
  },
  build: {
    // Enable cache bursting with content hashes in filenames
    rollupOptions: {
      output: {
        // Add content hash to JS files
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        // Add content hash to CSS files
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return `[name].[hash].${ext}`;
          }
          // For other assets (images, fonts, etc.)
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/.test(assetInfo.name || '')) {
            return `assets/[name].[hash].${ext}`;
          }
          return `assets/[name].[hash].${ext}`;
        }
      }
    },
    // Ensure all imports are properly processed for cache bursting
    assetsInlineLimit: 0, // Don't inline any assets to ensure they get hashed
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
