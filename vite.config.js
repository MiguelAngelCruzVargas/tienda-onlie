// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: '0.0.0.0',  // Permite conexiones desde cualquier IP
    port: 5173,
    cors: true,        // Habilita CORS en el servidor de desarrollo
    
    // Dominios permitidos para acceso externo
    allowedHosts: [
      'localhost',
      'tiendarines-frontend.loca.lt',
      'tiendarines-app.loca.lt',
      '.ngrok.io',     // Cualquier subdominio de ngrok.io
      '.loca.lt'       // Cualquier subdominio de loca.lt
    ],
    
    // Proxy para desarrollo local
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    },
    
    // Headers de seguridad
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    }
  },
  
  // Configuración de build
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 1600
  }
})