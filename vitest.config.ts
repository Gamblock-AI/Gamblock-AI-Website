import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'e2e'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'next/navigation': path.resolve(
        __dirname,
        'node_modules/next/navigation.js'
      ),
      'next/server': path.resolve(__dirname, 'node_modules/next/server.js'),
    },
  },
});
