import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Modifié pour le nom de domaine personnalisé (No-IP)
  base: '/', 
  plugins: [vue()],
})