import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
    sourcemap: false,
    // 청크 크기 제한 및 분할 최적화
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
          'monaco': ['monaco-editor', '@monaco-editor/loader'],
          'ui': ['vue-toast-notification', 'vue-scrollto']
        }
      }
    },
    // 빌드 최적화 옵션
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
