import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command}) => {
  if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
