import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import pug from 'pug'
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createFilter } from '@rollup/pluginutils';
import VitePugPlugin from 'vite-plugin-pug';

const filter = createFilter(/\.pug$/i);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
    VitePugPlugin({
      pug,
      include: '**/*.pug',
      exclude: 'node_modules/**',
      templateVars: (id) => {
        const data = readFileSync(resolve(process.cwd(), id), 'utf-8');
        return { data };
      },
      transforms: {
        compile: (template) => {
          if (!filter(template.id)) return null;
          return {
            code: pug.compile(template.data)(),
          };
        },
      },
    }),
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
