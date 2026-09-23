import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import { resolve } from 'path'

/* dev-only: serve /papers and /papers/x the way Cloudflare serves them in production */
const cleanUrls = {
  name: 'clean-urls',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [path, query] = req.url.split('?')
      if (path === '/papers' || path === '/papers/') {
        req.url = '/papers/index.html' + (query ? '?' + query : '')
      } else if (path.startsWith('/papers/') && !/\.[a-z0-9]+$/i.test(path)) {
        req.url = path + '.html' + (query ? '?' + query : '')
      }
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), glsl(), cleanUrls],
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        papers: resolve(__dirname, 'papers/index.html'),
        aiTrap: resolve(__dirname, 'papers/ai-trap.html'),
        mediCal: resolve(__dirname, 'papers/medi-cal-deserts.html')
      }
    }
  }
})