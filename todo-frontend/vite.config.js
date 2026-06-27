import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Use 'inline' source maps instead of Vite's default eval-based source maps.
  // This removes the need for 'unsafe-eval' in any Content-Security-Policy.
  build: {
    sourcemap: 'inline',
  },

  // Dev server: emit CSP headers that are fully safe (no unsafe-eval required).
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        // 'unsafe-inline' is needed for Vite's HMR injected style tags only.
        // No 'unsafe-eval' required with inline source maps.
        "script-src 'self' 'unsafe-inline'",
        // Allow inline styles + Google Fonts
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        // Allow fetch to Spring Boot backend + Vite's HMR WebSocket
        "connect-src 'self' http://localhost:8080 ws://localhost:5173",
        "img-src 'self' data:",
      ].join('; '),
    },
  },
})

