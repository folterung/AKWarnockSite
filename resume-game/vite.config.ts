import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/resume-game/',
  server: {
    port: 5174,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
