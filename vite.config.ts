import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = 'SatsEclipseRunner'; // Cambia si tu repo tiene otro nombre

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    disabled: true,
  },
});
