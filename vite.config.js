import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ส่วนที่เพิ่มใหม่เพื่อแก้ Warning เรื่องขนาดไฟล์ 👇
  build: {
    chunkSizeWarningLimit: 1600,
  },
  server: {
    headers: {
      // เปลี่ยนเป็น unsafe-none เพื่อปลดล็อกทุกอย่าง
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
})