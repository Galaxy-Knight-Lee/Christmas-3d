import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true // Expose to network for local testing if needed
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});