import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  build: {
    target: 'es2015',
  },
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'src/assets/icons')],
      symbolId: 'icon-[name]',
      inject: 'body-first',
      customDomId: '__svg__icons__dom__',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.ts', '.vue'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
});
