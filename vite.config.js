import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Le nom de ton repo GitHub exact
  base: '/Doublage-VFQ/', 
  plugins: [vue()],
})