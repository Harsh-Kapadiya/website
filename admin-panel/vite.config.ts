import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // In production this app is nested at https://your-domain.com/admin-panel/
  // (see the root README's "Deploying admin-panel under a path" section).
  // Dev server stays at "/" so `npm run dev` here is simple to test locally.
  base: command === 'build' ? '/admin-panel/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
  },
}))
