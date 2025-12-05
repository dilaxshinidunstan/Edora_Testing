import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist' // Specify the build output directory
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  assetsInclude: ['**/*.wasm'], // Ensures WASM files are served as static assets
  server: {
    proxy: {
      '/api': process.env.VITE_API_BASE_URL,
    },
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    },
  }
})
