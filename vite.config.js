import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalogo: resolve(__dirname, 'catalogo.html'),
        producto: resolve(__dirname, 'producto.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
