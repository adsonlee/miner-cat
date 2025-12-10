import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 把 './' 改为你的 '/仓库名/' (注意前后都有斜杠)
  base: '/miner-cat/', 
})
