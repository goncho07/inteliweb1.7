import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Build de librería para src/components/ui/ — independiente del build de la
// app (vite.config.ts). Genera dist-lib/index.es.js + .d.ts para que
// herramientas externas (p. ej. Claude Design) puedan importar los
// componentes reales del sistema de diseño en vez de recrearlos.
export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src/components/ui',
      outDir: 'dist-lib',
      include: ['src/components/ui/**/*.ts', 'src/components/ui/**/*.tsx'],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, 'src/components/ui/index.ts'),
      name: 'IntelicoleUI',
      formats: ['es'],
      fileName: () => 'index.es.js',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@radix-ui/react-avatar',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-label',
        '@radix-ui/react-progress',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-tooltip',
        'class-variance-authority',
        'lucide-react',
        'clsx',
        'tailwind-merge',
      ],
    },
  },
});
