import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/grammatical-gender-game/',
  build: {
    outDir: 'build',
  },
});