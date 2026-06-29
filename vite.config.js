import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    envPrefix: 'NEXT_PUBLIC_',

    server: {
      proxy: {
        // Forward all /api/method/* calls to the Frappe backend.
        // This bypasses CORS restrictions during local development.
        '/api': {
          target: env.NEXT_PUBLIC_PROXY_TARGET || 'https://tackiness-cesspool-pretended.ngrok-free.dev',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
