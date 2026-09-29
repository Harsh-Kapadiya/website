import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ command }) => ({
  // Production: served from https://your-site/admin-panel/ (nested into the
  // frontend build by vercel.json). Dev: plain http://localhost:5174/.
  base: command === 'build' ? '/admin-panel/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5174 },
}));
