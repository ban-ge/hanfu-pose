import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-reference-assets',
      closeBundle() {
        cpSync(resolve('assets'), resolve('dist/assets'), { recursive: true });
      },
    },
  ],
});
