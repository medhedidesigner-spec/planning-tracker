import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANT : remplace 'planning-tracker' par le nom exact de ton repo GitHub
  base: '/planning-tracker/',
})
