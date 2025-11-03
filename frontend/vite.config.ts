import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use dynamic base path for GitHub Pages
  // Must match your repository name exactly
  // Use process.env.NODE_ENV in config file (runs in Node.js)
  base: process.env.NODE_ENV === 'production' ? '/ZEC-Market-Cap/' : '/',
  build: {
    outDir: 'dist',
  },
})

