import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
    },
    preview: {
      port: 3000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          // Las librerías pesadas van a chunks propios: cambian mucho menos que
          // el código de la app, así que el navegador las mantiene cacheadas
          // entre despliegues.
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
              return 'react-vendor';
            }
            if (/[\\/]node_modules[\\/](recharts|d3-|victory-)/.test(id)) return 'charts';
            if (id.includes('framer-motion')) return 'motion';
          },
        },
      },
    },
  };
});
