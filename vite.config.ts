import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'artifacts/sabaik-almasa/src'),
        '@workspace/api-client-react': path.resolve(__dirname, 'lib/api-client-react/src'),
        '@workspace/api-zod': path.resolve(__dirname, 'lib/api-zod/src'),
        '@workspace/db': path.resolve(__dirname, 'lib/db/src'),
        '@assets': path.resolve(__dirname, 'attached_assets'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      // HMR is disabled in AI Studio to prevent WebSocket conflicts
      hmr: false,
      watch: null,
    },
  };
});
