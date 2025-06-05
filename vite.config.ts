import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  clearScreen: false,
  base: "",
  server: {
    port: 8080,
    open: true,
  },
});
