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

})

