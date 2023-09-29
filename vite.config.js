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
      // local 환경 - proxyTable 설정
      '/api': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true,
      },
    },
    disableHostCheck: true,
  },
});
