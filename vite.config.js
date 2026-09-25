import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import { resolve } from 'path'
import { execFileSync } from 'child_process'

/* The pages are client-rendered, so without this the HTML ships with no text in
   it and any crawler that does not run JS sees a blank page. It hangs off the
   build itself rather than an npm postbuild hook, so a bare `vite build` cannot
   skip it. */
const prerender = {
  name: 'prerender',
  apply: 'build',
  closeBundle() {
    execFileSync('node', [resolve(__dirname, 'scripts/prerender.cjs')], { stdio: 'inherit' })
  },
}

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
  plugins: [react(), glsl(), cleanUrls, prerender],
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