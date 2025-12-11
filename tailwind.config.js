/** @type {import('tailwindcss').Config} */
export default {
  // 核心修复点：确保这里包含了 src 下的所有 ts/tsx 文件
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
