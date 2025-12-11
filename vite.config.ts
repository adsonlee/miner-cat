import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 必须有这一行，且必须是你的仓库名，前后都要有斜杠
  base: '/miner-cat/', 
  build: {
    outDir: 'dist',
  }
})
