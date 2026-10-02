import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

export default defineConfig(({ mode }) => ({
  plugins: [react(), cesium()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://sih2026-xdr2.onrender.com',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://samudratech.vercel.app',
        },
      },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 8000,
  },
  optimizeDeps: {
    include: [
      'deck.gl',
      '@deck.gl/react',
      '@deck.gl/layers',
      '@deck.gl/aggregation-layers',
      '@deck.gl/geo-layers',
    ],
  },
}))
