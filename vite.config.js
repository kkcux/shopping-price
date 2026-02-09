import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'
import placesProxyMiddleware from './src/middlewares/placesProxy'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'api-places-nearby',
        configureServer(server) {
          server.middlewares.use(placesProxyMiddleware(env))
        }
      }
    ],
    server: {
      headers: {
        // เปลี่ยนเป็น unsafe-none เพื่อปลดล็อกทุกอย่าง
        "Cross-Origin-Opener-Policy": "unsafe-none",
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },
    },
  }
})