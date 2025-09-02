import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      // Adjust target during dev if your server runs locally on 4000
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
})
