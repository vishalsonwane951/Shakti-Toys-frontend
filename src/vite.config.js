import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split vendor libraries to reduce main bundle size
        manualChunks: {
          vendor: ['react', 'react-dom', 'axios', 'swiper', 'bootstrap']
        }
      }
    },
    // Optional: increase chunk size warning limit if needed
    chunkSizeWarningLimit: 600
  }
})