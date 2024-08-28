import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import {defineConfig, loadEnv} from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig(({mode}) => {
  // Currently our configuration only reads ENV variables which
  // are prefixed with 'VITE_' (default, for security reasons).
  const env = loadEnv(mode, process.cwd());

  return {
    base: '',
    plugins: [react(), viteTsconfigPaths()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      exclude: [...configDefaults.exclude, 'src/**/*.stories.tsx']
    },
    server: {
      open: true,
      port: parseInt(env.VITE_PORT || '3000', 10),
    },
    build: {
      cssCodeSplit: false,
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
  };
});
