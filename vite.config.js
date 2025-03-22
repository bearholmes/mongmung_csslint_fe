import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    port: 5001,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5002',
        // target: 'https://csslint.mongmung.ium.kr',
        changeOrigin: true,
      },
    },
  },
  build: {
    emptyOutDir: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 1024, // 작은 에셋만 인라인화
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 더 작은 청크로 분할
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
