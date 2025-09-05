import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5001/api'),
  },
})