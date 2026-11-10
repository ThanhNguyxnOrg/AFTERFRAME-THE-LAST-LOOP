import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-three',
              test: /node_modules[\\/]three/,
            },
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|scheduler)/,
            },
            {
              name: 'game-simulation',
              test: /src[\\/]game[\\/](simulation|config|types)\.ts$/,
            },
            {
              name: 'game-renderer',
              test: /src[\\/]game[\\/](renderer|models)\.ts$/,
            },
            {
              name: 'game-io',
              test: /src[\\/]game[\\/](audio|input)\.ts$/,
            },
          ],
        },
      },
    },
  },
});
