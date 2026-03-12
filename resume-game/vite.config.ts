import { defineConfig, type Plugin } from 'vite';
import path from 'path';

// Strip trailing slashes on sub-paths so proxied requests (e.g. /@vite/client/) resolve correctly
function stripTrailingSlash(): Plugin {
  return {
    name: 'strip-trailing-slash',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && req.url.endsWith('/') && req.url !== '/' && req.url !== '/resume-game/') {
          req.url = req.url.slice(0, -1);
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: '/resume-game/',
  plugins: [stripTrailingSlash()],
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
