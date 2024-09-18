import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import {defineConfig, loadEnv} from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  // Currently our configuration only reads ENV variables which
  // are prefixed with 'VITE_' (default, for security reasons).
  const env = loadEnv(mode, process.cwd());

  return {
    base: '/',
    plugins: [
      react(),
      viteTsconfigPaths(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src', // Your service worker directory
        filename: 'service-worker.ts', // Your service worker filename
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,png,svg}'], // Adjust patterns as needed
        }
      })
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
    },
    server: {
      open: true,
      port: parseInt(env.VITE_PORT || '3000', 10),
    },
    build: {
      cssCodeSplit: false
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
    envDir: '.'
  };
});
