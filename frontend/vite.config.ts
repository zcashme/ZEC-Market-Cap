import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use dynamic base path for GitHub Pages
  // Must match your repository name exactly
  base: import.meta.env.MODE === 'production' ? '/ZEC-Market-Cap/' : '/',
  build: {
    outDir: 'dist',
  },
})

