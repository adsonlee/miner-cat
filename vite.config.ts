import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/miner-cat/', // 必须，GitHub Pages 子路径
});
