import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Это заставит Vite слушать все интерфейсы
    port: 5173,
  }
})